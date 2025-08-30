import pandas as pd

class cognitive_profiler:
    def __init__(self, locations):
        self.locations = locations
        self.model = {}
    
    def build_profile(self, data_df):
        """Learns a unified routine from a pandas DataFrame."""

        if data_df.empty:
            print("Warning: No data to build profile.")
            return

        df = data_df.copy()
        df['start_time'] = pd.to_datetime(df['start_time'])
        df['hour'] = df['start_time'].dt.hour
        df['prev_location'] = df['location'].shift(1)
        df = df.dropna()

        location_counts = df.pivot_table(index ='hour', columns='location', aggfunc='size', fill_value=0)
        self.model['location_probs'] = (location_counts+1).div(location_counts.sum(axis=1) + len(self.locations), axis = 0)
        self.model['dynamic_thresholds'] = self.model['location_probs'][self.model['location_probs'] > 0].min(axis=1) * 0.9

        transition_counts = df.pivot_table(index = 'prev_location', column = 'location', aggfunc = 'size', fill_value = 0)
        self.model['transition_probs'] = (transition_counts + 1).div(transition_counts.sum(axis=1) + len(self.locations), axis = 0)

        self.model['duration_stats'] = df.groupby(['location', 'hour'])['duration_minutes'].agg(['mean','std']).fillna(0)

        print("Profile Built.")
    
    def _get_severity(self, anomaly_type, location, hour, duration_minutes=0):
        # Define rules
        return 1, "Deviation from routine"
    
    def check_anomaly(self, current_timestamp, current_location, prev_location, current_location_start_time):
        ts = pd.to_datetime(current_timestamp)
        hour = ts.hour

        if not self.model:
            return {"is_anomaly": False, "reason": "No model trained."}
        
        #Location Check
        try:
            prob = self.model['location_probs'].loc[hour, current_location]
            threshold = self.model['dynamic_thresholds'].loc[hour]
            if prob < threshold: 
                severity, reason = self._get_severity('location', current_location, hour)
                return {"is_anomaly" : True,"severity_level" : severity, "reason" : reason}
        except KeyError:
            severity, reason = self._get_severity('location', current_location, hour)
            return {"is_anomaly": True, "severity_level": severity, "reason": reason}
        
        #Transition Check
        try:
            trans_prob = self.model['transition_probs'].loc[prev_location, current_location]
            if trans_prob < 0.05:
                severity, reason = self._get_severity('Transition', current_location, hour)
                return {"is_anomaly": True, "severity_level": severity, "reason": reason}
        except KeyError:
            pass

        #Duration Check
        try:
            stats = self.model['duration_stats'].loc[(current_location, hour)]
            mean_dur, std_dur = stats['mean'], stats['std']
            duration_threshold = mean_dur + 2*std_dur
            current_duration = (ts - pd.to_datetime(current_location_start_time)).total_seconds()/60
            if current_duration > duration_threshold and mean_dur > 0:
                severity, reason = self._get_severity('Duration', current_location, hour, current_duration)
                return {"is_anomaly": True, "severity_level": severity, "reason": reason}
        except KeyError:
            pass
        return {"is_anomaly": False, "reason": "Activity appears normal."}
    