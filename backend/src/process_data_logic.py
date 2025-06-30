# Логика для обработки data.json и генерации hui.json (last-try.ipynb)
import shutil
import os
from src import consts
from src import sql
import polars as pd
import duckdb
import pandas
import json
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.manifold import TSNE
from sklearn.ensemble import IsolationForest
import networkx as nx
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from geopy.distance import geodesic
from pyproj import Proj


def df_to_json(df):
    if not all(col in df.columns for col in ['lat', 'lng', 'weight']):
        raise ValueError("DataFrame должен содержать колонки 'lat', 'lng' и 'weight'")
    records = df[['lat', 'lng', 'weight']].to_dict('records')
    result = {'path': records}
    return json.dumps(result, ensure_ascii=False)


def run_process_json(data: dict) -> dict:
    # 1. Преобразуем входной data.json в DataFrame
    path_points_df = pd.DataFrame([
        {
            'id': point['id'],
            'lat': point['position']['lat'],
            'lng': point['position']['lng'],
            'isFree': point['isFree']
        } for point in data['pathPoints']
    ])
    grid_data = []
    for row in data['gridAroundPath']:
        for item in row:
            print(item)
            grid_data.append({
                'point_key': item['id'],
                'weight': -1 if item['weight'] == -1 else 0,
                'lat': item['position']['lat'],
                'lng': item['position']['lng']
            })
    grid_df = pd.DataFrame(grid_data)

    con = duckdb.connect(consts.PATH_TO_DUCKDB)
    con.sql(sql.ddl.DROP_GRID_TABLE)
    con.sql(sql.ddl.CREATE_GRID_TABLE)
    data_for_points = con.sql(sql.dml.SELECT_NEAR_SEGMENTS).pl()
    con.close()

    # --- Фичи и ML ---
    if len(data_for_points) == 0:
        return {"path": []}
    # Фичи
    data_for_points = (
        data_for_points.with_columns(
            f_distance_ratio=(pd.col("min_distance") / (pd.col("total_distance_km") + 1e-5)),
            f_time_ratio=(pd.col("duration_minutes") / pd.col("duration_minutes").max()),
            f_speed_stability=(pd.col("max_sog") - pd.col("min_sog")) / (pd.col("avg_sog") + 1e-5),
            f_course_stability=pd.col("max_cog_change") / 360.0,
            f_point_density=pd.col("n_points") / (pd.col("duration_minutes") / 60.0 + 1),
        )
        .group_by(["point_key", "point_lat", "point_lng"])
        .agg([
            pd.mean(["f_distance_ratio"]),
            pd.max("f_time_ratio"),
            pd.quantile("f_speed_stability", 0.75),
            pd.mean("f_course_stability"),
            pd.var("f_point_density"),
            (pd.col("f_point_density") * pd.col("min_distance").exp().neg()).sum().alias("f_proximity_weighted_densityy"),
        ])
    )
    # ML pipeline (примерно как в ноутбуке)
    feature_columns = [col for col in data_for_points.columns if col.startswith('f_')]
    X = data_for_points.select(feature_columns).to_numpy()
    scaler = StandardScaler()
    X_scaled = np.nan_to_num(scaler.fit_transform(X))
    kmeans = KMeans(n_clusters=5, random_state=42)
    clusters = kmeans.fit_predict(X_scaled)
    iso_forest = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    anomaly_scores = iso_forest.fit_predict(X_scaled)
    weights_iso_forest = -0.5 * anomaly_scores + 0.5
    # Автоэнкодер
    n_features = X_scaled.shape[1]
    input_layer = Input(shape=(n_features,))
    encoded = Dense(8, activation='relu')(input_layer)
    decoded = Dense(n_features, activation='linear')(encoded)
    autoencoder = Model(input_layer, decoded)
    autoencoder.compile(optimizer='adam', loss='mse')
    autoencoder.fit(X_scaled, X_scaled, epochs=10, batch_size=32, shuffle=True, verbose=0)
    encoder = Model(input_layer, encoded)
    latent_features = encoder.predict(X_scaled)
    weights_autoencoder = np.linalg.norm(latent_features, axis=1)
    weights_autoencoder = (weights_autoencoder - weights_autoencoder.min()) / (weights_autoencoder.max() - weights_autoencoder.min() + 1e-8)
    # Графовые признаки (упрощённо)
    graph_centrality = np.zeros(len(data_for_points))
    # Комбинируем веса
    final_weights = (
        0.4 * weights_iso_forest + 
        0.3 * weights_autoencoder  
        # 0.3 * graph_centrality
    )
    # Собираем результат
    data_for_points = data_for_points.with_columns([
        pd.Series("weight", final_weights).cast(pd.Float32)
    ])
    # Собираем финальный json
    result = []
    for row in data_for_points.rows():
        row_dict = dict(zip(data_for_points.columns, row))
        print(row_dict)
        id = row_dict.get('point_key', '')
        lat = float(row_dict.get('point_lat', 0))
        lng = float(row_dict.get('point_lng', 0))
        print(f"Processing point: id={id}, lat={lat}, lng={lng}")
        weight = float(row_dict.get('weight', 0))
        result.append({"id": id, "lat": lat, "lng": lng, "weight": weight})
    return {"path": result}
