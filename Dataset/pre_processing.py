import pandas as pd
import os

# Specifica il percorso del file CSV
NO2_file = '2024-01-09 2001_2022 NO2 _STATISTICHE.csv'
PM10_file = '2024-01-09_2002_2022_PM10__statistiche.csv'
PM25_file = '2024-01-09_2004_2022_PM25__statistiche.csv'
O3_file = '2024-02-26_2002_2022_o3_statistiche 2.csv'

# Leggi il file CSV utilizzando pandas
df_no2 = pd.read_csv(NO2_file, sep=";")
df_pm10 = pd.read_csv(PM10_file,sep=";")
df_pm25 = pd.read_csv(PM25_file, sep=";")
df_o3 = pd.read_csv(O3_file, sep=";")

columns_to_keep = ['station_eu_code','Regione', 'Provincia', 'Comune', 'tipo_zona', 'Lon', 'Lat', 'yy', 'media_yy', 'minimo', 'massimo']  
no2 = df_no2[columns_to_keep]
pm10 = df_pm10[columns_to_keep]
pm25 = df_pm25[columns_to_keep]
o3 = df_o3[columns_to_keep]

# Dati divisi per anno
columns_to_keep = ['Regione','Provincia','Lon', 'Lat', 'yy', 'media_yy']  
no2 = df_no2[columns_to_keep]
pm10 = df_pm10[columns_to_keep]
pm25 = df_pm25[columns_to_keep]
o3 = df_o3[columns_to_keep]
os.makedirs('years_no2', exist_ok=True)
os.makedirs('years_pm10', exist_ok=True)
os.makedirs('years_pm25', exist_ok=True)
os.makedirs('years_o3', exist_ok=True)

# Raggruppare i dati per anno e scrivere ogni gruppo in un file CSV separato
for year, data in no2.groupby('yy'):
    data = data.drop(columns=['yy'])
    output_file = os.path.join('years_no2', f'dati_{year}.csv')
    data.to_csv(output_file, index=False)

for year, data in pm10.groupby('yy'):
    data = data.drop(columns=['yy'])
    output_file = os.path.join('years_pm10', f'dati_{year}.csv')
    data.to_csv(output_file, index=False)

for year, data in pm25.groupby('yy'):
    data = data.drop(columns=['yy'])
    output_file = os.path.join('years_pm25', f'dati_{year}.csv')
    data.to_csv(output_file, index=False)

for year, data in o3.groupby('yy'):
    data = data.drop(columns=['yy'])
    output_file = os.path.join('years_o3', f'dati_{year}.csv')
    data.to_csv(output_file, index=False)

# Directory dove si trovano i file divisi per tipo di inquinante
dir_no2 = 'years_no2'
dir_pm10 = 'years_pm10'
dir_pm25 = 'years_pm25'
dir_o3 = 'years_o3'
output_dir = 'years_total'

# Creazione della cartella di output se non esiste
os.makedirs(output_dir, exist_ok=True)

# Ottieni una lista di anni dai file nella directory no2
years = [(f.split('_')[1]).split('.')[0] for f in os.listdir(dir_no2) if f.endswith('.csv') and int((f.split('_')[1]).split('.')[0]) >= 2010]

for year in years:
    # Lettura dei file CSV per ogni anno
    no2_df = pd.read_csv(os.path.join(dir_no2, f'dati_{year}.csv'))
    pm10_df = pd.read_csv(os.path.join(dir_pm10, f'dati_{year}.csv'))
    pm25_df = pd.read_csv(os.path.join(dir_pm25, f'dati_{year}.csv'))
    o3_df = pd.read_csv(os.path.join(dir_o3, f'dati_{year}.csv'))

    # Rinomina le colonne per evitare conflitti durante l'unione
    no2_df = no2_df.rename(columns={'media_yy': 'no2'})
    pm10_df = pm10_df.rename(columns={'media_yy': 'pm10'})
    pm25_df = pm25_df.rename(columns={'media_yy': 'pm25'})
    o3_df = o3_df.rename(columns={'media_yy': 'o3'})

    # Unisci i dati sui campi 'Regione' e 'Provincia'
    merged_df = pd.merge(no2_df, pm10_df, on=['Regione', 'Provincia','Lat','Lon'], how='outer')
    merged_df = pd.merge(merged_df, pm25_df, on=['Regione', 'Provincia', 'Lat','Lon'], how='outer')
    merged_df = pd.merge(merged_df, o3_df, on=['Regione', 'Provincia','Lat','Lon'], how='outer')

    # Rimuovi le righe che hanno tutti i valori di inquinanti nulli
    merged_df = merged_df.dropna(subset=['no2', 'pm10', 'pm25', 'o3'], how='all')

    # Salva il file unito nella directory di output
    output_path = os.path.join(output_dir, f'dati_{year}.csv')
    merged_df.to_csv(output_path, index=False)


