INSERT_LOGS = """
insert into aisdk_log
WITH sorted_data AS (
    SELECT *,
        LEAD('# Timestamp') OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS next_timestamp,
        LEAD('Latitude') OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS next_latitude,
        LEAD('Longitude') OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS next_longitude,
        LEAD('COG') OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS next_cog,
        LEAD('SOG') OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS next_sog
    FROM '{file_name}'
),
distance_calculations AS (
    SELECT *,
        (JULIAN(next_timestamp) - JULIAN('# Timestamp')) * 24 * 60 AS time_diff_minutes,
        6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(next_latitude - Latitude) / 2), 2) +
            COS(RADIANS(Latitude)) * COS(RADIANS(next_latitude)) *
            POWER(SIN(RADIANS(next_longitude - Longitude) / 2), 2)
        )) AS distance_km,
        ABS(next_cog - COG) AS cog_change
    FROM sorted_data
),
path_segments AS (
    SELECT *,
        CASE
            WHEN time_diff_minutes > 60 THEN 1
            WHEN distance_km > 10 THEN 1
            WHEN cog_change > 45 THEN 1
            WHEN next_sog IS NOT NULL AND next_sog < 0.5 AND SOG >= 0.5 THEN 1
            ELSE 0
        END AS is_new_segment
    FROM distance_calculations
),
segment_assignment AS (
    SELECT *,
        SUM(is_new_segment) OVER (PARTITION BY MMSI ORDER BY '# Timestamp') AS segment_id
    FROM path_segments
),
min_max_timestamps AS (
    SELECT MMSI, segment_id, MIN('# Timestamp') AS start_time, MAX('# Timestamp') AS end_time,
        ARRAY_AGG(STRUCT_PACK(Latitude, Longitude) ORDER BY sa.'# Timestamp') AS path_points,
        AVG(Latitude) AS avg_latitude, AVG(Longitude) AS avg_longitude,
        SUM(distance_km) AS total_distance_km, AVG(SOG) AS avg_sog, MAX(SOG) AS max_sog, MIN(SOG) AS min_sog,
        AVG(COG) AS avg_cog, MAX(cog_change) AS max_cog_change,
        arg_min(sa.Latitude, sa.'# Timestamp') AS start_latitude,
        arg_min(sa.Longitude, sa.'# Timestamp') AS start_longitude,
        arg_max(sa.Latitude, sa.'# Timestamp')  AS end_latitude,
        arg_max(sa.Longitude, sa.'# Timestamp') AS end_longitude,
        COUNT(*) AS n_points
    FROM segment_assignment sa
    GROUP BY MMSI, segment_id
),
aggregated_segments AS (
    SELECT mm.*, (JULIAN(mm.end_time) - JULIAN(mm.start_time)) * 24 * 60 AS duration_minutes
    FROM min_max_timestamps mm
)
SELECT * FROM aggregated_segments
"""

SELECT_DISTINCT_DATES_FROM_LOGS = """
select date_trunc('day',"start_time")::date::varchar as dt from aisdk_log group by 1
"""

SELECT_NEAR_SEGMENTS = """
    with 
    filtered_segments as (
        select 
            a.point_key, 
            a.lat as point_lat,
            a.lng as point_lng,
            b.kk as segment_key,
            b.start_time,
            b.end_time,
            b.avg_latitude,
            b.avg_longitude,
            b.total_distance_km,
            b.avg_sog,
            b.max_sog,
            b.min_sog,
            b.avg_cog,
            b.max_cog_change,
            b.start_latitude,
            b.start_longitude,
            b.end_latitude,
            b.end_longitude,
            b.n_points,
            b.duration_minutes
        from grid_t as a
            inner join aisdk_log as b
                on b.avg_latitude between a.lat - 0.02 and a.lat + 0.02
            and b.avg_longitude between a.lng - 0.02 and a.lng + 0.02
        where b.n_points > 5
    ) 
    , calculations as (
        select 
            f.*,
            (end_latitude - start_latitude) as seg_lat,
            (end_longitude - start_longitude) as seg_lng,
            (point_lat - start_latitude) as vec_lat,
            (point_lng - start_longitude) as vec_lng,
            power(end_latitude - start_latitude, 2) + power(end_longitude - start_longitude, 2) as seg_len_sq
        from filtered_segments f
    ), projections as (
        select 
            c.*,
            (vec_lat * seg_lat + vec_lng * seg_lng) / nullif(seg_len_sq, 0) as proj
        from calculations c
    ), distances as (
        select 
            *,
            SQRT(POWER((point_lat - start_latitude)*111, 2) + POWER((point_lng - start_longitude)*111*COS(RADIANS(point_lat)), 2)) as dist_start,
            SQRT(POWER((point_lat - end_latitude)*111, 2) + POWER((point_lng - end_longitude)*111*COS(RADIANS(point_lat)), 2)) as dist_end,
            case
            when proj between 0 and 1 then
                SQRT(POWER((point_lat - (start_latitude + proj*seg_lat))*111, 2)
                + POWER((point_lng - (start_longitude + proj*seg_lng))*111*COS(RADIANS(point_lat)), 2)
                )
            else null
            end as dist_proj
        from projections
    ), min_distances as (
        select *,
            least(
                dist_start,
                dist_end,
                COALESCE(dist_proj, 1e9)
            ) as min_distance
        FROM distances
    ), result as (
        select 
            point_key,
            point_lat,
            point_lng,
            segment_key,
            min_distance,
            start_time,
            end_time,
            avg_latitude,
            avg_longitude,
            total_distance_km,
            avg_sog,
            max_sog,
            min_sog,
            avg_cog,
            max_cog_change,
            start_latitude,
            start_longitude,
            end_latitude,
            end_longitude,
            n_points,
            duration_minutes
        FROM min_distances
        WHERE min_distance < 0.5
    )
    select * from result
"""