CREATE_TABLE_LOGS = """
CREATE TABLE aisdk_log(
    MMSI BIGINT, 
    segment_id HUGEINT, 
    start_time TIMESTAMP, 
    end_time TIMESTAMP, 
    path_points STRUCT(Latitude DOUBLE, Longitude DOUBLE)[], 
    avg_latitude DOUBLE, 
    avg_longitude DOUBLE, 
    total_distance_km DOUBLE, 
    avg_sog DOUBLE, 
    max_sog DOUBLE, 
    min_sog DOUBLE, 
    avg_cog DOUBLE, 
    max_cog_change DOUBLE, 
    start_latitude DOUBLE, 
    start_longitude DOUBLE, 
    end_latitude DOUBLE, 
    end_longitude DOUBLE, 
    n_points BIGINT, 
    duration_minutes DOUBLE, 
    kk UUID DEFAULT(NULL));
"""

DROP_GRID_TABLE = """
DROP TABLE IF EXISTS grid_t;
"""

CREATE_GRID_TABLE = """
    create table grid_t as 
    select 
        --md5(lat::text || '$' || lng::text)::uuid as point_key,
        point_key as point_key,
        * 
    from grid_df
    where weight > -1;
"""