import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import seaborn as sns

# Dataset - cambia per ogni anno
df = pd.read_csv('./years_total/dati_2022.csv')

# Seleziona le colonne per la t-SNE (escludendo eventuali colonne non numeriche)
features = ['no2', 'pm10', 'pm25', 'o3']
region_means = df.groupby('Regione')[features].mean().reset_index()
region_means = region_means.dropna().reset_index(drop=True)


# Cluster con category

# # Definire i range e i label per ogni inquinante
# def label_pm25(value):
#     if value <= 10:
#         return 'Good'
#     elif value <= 20:
#         return 'Fair'
#     elif value <= 25:
#         return 'Moderate'
#     elif value <= 50:
#         return 'Poor'
#     elif value <= 75:
#         return 'Very poor'
#     else:
#         return 'Extremely poor'

# def label_pm10(value):
#     if value <= 20:
#         return 'Good'
#     elif value <= 40:
#         return 'Fair'
#     elif value <= 50:
#         return 'Moderate'
#     elif value <= 100:
#         return 'Poor'
#     elif value <= 150:
#         return 'Very poor'
#     else:
#         return 'Extremely poor'

# def label_no2(value):
#     if value <= 40:
#         return 'Good'
#     elif value <= 90:
#         return 'Fair'
#     elif value <= 120:
#         return 'Moderate'
#     elif value <= 230:
#         return 'Poor'
#     elif value <= 340:
#         return 'Very poor'
#     else:
#         return 'Extremely poor'

# def label_o3(value):
#     if value <= 50:
#         return 'Good'
#     elif value <= 100:
#         return 'Fair'
#     elif value <= 130:
#         return 'Moderate'
#     elif value <= 240:
#         return 'Poor'
#     elif value <= 380:
#         return 'Very poor'
#     else:
#         return 'Extremely poor'

# # Definire la funzione per determinare il label generale
# def worst_label(row):
#     labels = [row['label_pm25'], row['label_pm10'], row['label_no2'], row['label_o3']]
#     order = ['Good', 'Fair', 'Moderate', 'Poor', 'Very poor', 'Extremely poor']
#     worst = max(labels, key=lambda x: order.index(x))
#     return worst

# # Applicare le funzioni per ottenere i label
# region_means['label_no2'] = region_means['no2'].apply(label_no2)
# region_means['label_pm10'] = region_means['pm10'].apply(label_pm10)
# region_means['label_pm25'] = region_means['pm25'].apply(label_pm25)
# region_means['label_o3'] = region_means['o3'].apply(label_o3)

# region_means['worst_label'] = region_means.apply(worst_label, axis=1)
# region_means.to_csv('result.csv')
# labels = region_means['worst_label']




# Standardizzazione dei dati
scaler = StandardScaler()
df_scaled = scaler.fit_transform(region_means[features])


# Applica t-SNE
tsne = TSNE(n_components=2, perplexity=2,random_state=42)
tsne_results = tsne.fit_transform(df_scaled)


region_means['tsne-2d-one'] = tsne_results[:,0]
region_means['tsne-2d-two'] = tsne_results[:,1]

 # Clustering dei dati trasformati dalla t-SNE
kmeans = KMeans(n_clusters=3, random_state=42)
region_means['cluster'] = kmeans.fit_predict(tsne_results)
labels = region_means['cluster']

# Visualizzare i risultati
plt.figure(figsize=(10,8))
sns.scatterplot(
    x='tsne-2d-one', y='tsne-2d-two',
    hue=labels,
    palette=sns.color_palette("hsv", len(region_means['cluster'].unique())),
    data=region_means,
    legend="full",
    alpha=0.8
)

for i,regione in enumerate(region_means['Regione']):
    
    plt.annotate(regione, (region_means['tsne-2d-one'][i], region_means['tsne-2d-two'][i]))
plt.title("t-SNE ")
plt.show()



df_tsne = pd.DataFrame(tsne_results, columns=['Component 1', 'Component 2'])
df_tsne['labels'] = region_means['cluster'] 
df_tsne['Regione'] = region_means['Regione']


# # # Salvataggio del DataFrame in un file CSV
df_tsne.to_csv('tsne-results/Regions/tsne_results_2022.csv', index=False)








