import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import seaborn as sns

# Dataset - cambia per ogni anno
df = pd.read_csv('years_total/dati_2022.csv')

# Seleziona le colonne per la t-SNE (escludendo eventuali colonne non numeriche)
features = ['no2', 'pm10', 'pm25', 'o3']
region_means = df.groupby('Provincia')[features].mean().reset_index()
region_means = region_means.dropna().reset_index(drop=True)




# Standardizzazione dei dati
scaler = StandardScaler()
df_scaled = scaler.fit_transform(region_means[features]) #media=0 dev.std.=1


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
    data=region_means,
    legend="full",
    alpha=0.8
)

for i,regione in enumerate(region_means['Provincia']):
    
    plt.annotate(regione, (region_means['tsne-2d-one'][i], region_means['tsne-2d-two'][i]))
plt.title("t-SNE ")
plt.show()



df_tsne = pd.DataFrame(tsne_results, columns=['Component 1', 'Component 2'])
df_tsne['labels'] = region_means['cluster'] 
df_tsne['Provincia'] = region_means['Provincia']


# # # Salvataggio del DataFrame in un file CSV
df_tsne.to_csv('tsne-results/Province/tsne_results_2022.csv', index=False)








