import pandas as pd
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
import seaborn as sns
from sklearn import preprocessing

# Dataset
df = pd.read_csv('years_total/dati_2010.csv')


selected_columns = ['no2', 'pm10', 'pm25', 'o3']

# Group by 'Provincia' 
data_numeric = df.groupby('Provincia')[selected_columns].mean().reset_index()
data_numeric = data_numeric.dropna().reset_index(drop=True)
provinces = data_numeric['Provincia']
data_numeric_values = data_numeric[selected_columns].values

# Standardization 
scaler = StandardScaler()
data_scaled = scaler.fit_transform(data_numeric_values)

# Apply t-SNE
tsne_results = TSNE(perplexity=5).fit_transform(data_scaled)

# t-SNE results
df_tsne = pd.DataFrame(tsne_results, columns=['Axis 1', 'Axis 2'])
df_tsne['Provincia'] = provinces


plt.figure(figsize=(10,8))
sns.scatterplot(
    x='Axis 1', y='Axis 2',
    data=df_tsne,
    legend=False
)


for i, province in enumerate(df_tsne['Provincia']):
    plt.annotate(province, (df_tsne['Axis 1'][i], df_tsne['Axis 2'][i]))

plt.title("t-SNE")
plt.show()


df_tsne = pd.concat([df_tsne, data_numeric[selected_columns].reset_index(drop=True)], axis=1)
df_tsne.to_csv('tsne-results/Province/tsne_results_2010.csv', index=False)








