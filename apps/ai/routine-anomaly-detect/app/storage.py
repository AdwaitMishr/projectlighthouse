import sqlite3
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict

class Storage:
    def __init__(self, db_path = 'ai/data/routing_log.db'):
        self.db_path = db_path
        self.con = sqlite3.connect(db_path, check_same_thread=False)
        self.setup_database()

    def setup_database(self):
        cur = self.con.cursor()
        cur.execute(
            """CREATE TABLE IF NOT EXISTS states(
            start_time TEXT, end_time TEXT, duration_mins INTEGER, location TEXT
            )"""
        )
        self.con.commit()

    def bulk_insert_states(self, daily_log: List[Dict]):
        """Inserts a batch of completed states from the daily log into the database."""

        if not daily_log:
            return
        records_to_insert = [
            (
                state['start_time'],
                state['end_time'],
                state['duration_mins'],
                state['location']
            ) for state in daily_log
        ]
        cur = self.con.cursor()
        cur.executemany("INSERT INTO states VALUES (?, ?, ?, ?)", records_to_insert)
        self.con.commit()
        print(f"Successfully inserted {len(records_to_insert)} records from daily log.")
    
    def clear_old_data(self, days_to_keep = 30):
        """Deletes records older than a specified number of days to keep the DB lean."""

        cutoff_date = datetime.now() - timedelta(days_to_keep)
        cur = self.con.cursor()
        cur.execute(f"DELETE FROM states WHERE start_time < '{cutoff_date.isoformat()}'")
        self.con.commit()
        print(f"Cleared records older than {days_to_keep} days.")

    def get_data_for_profiling(self, days = 14):
        """Fetches the last 14 days of data for model training."""

        query_date = datetime.now() - timedelta(days = days)
        try:
            df = pd.read_sql_query(
                f"SELECT * FROM states WHERE start_time >= '{query_date.isoformat()}'", self.con
            )
            return df
        except Exception as e:
            print(f"Error fetching data: {e}")
            return pd.DataFrame()