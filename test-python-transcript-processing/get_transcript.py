import sqlite3

DB_PATH = 'results.db'

def video_is_saved(video_id: str) -> bool:
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(
            "SELECT video_id, video_title, channel_name, text, model_used, score FROM results WHERE video_id = ? LIMIT 1",
            (video_id,)
        )
        row = cursor.fetchone()

    if row is None:
        return False
    
    print({
        #"video_id": row[0],
        "video_title": row[1],
        "channel_name": row[2],
        "text": row[3],
        #"model_used": row[4],
        "score": row[5],
    })
    return True

video_is_saved("aKTOS0Nrlug")