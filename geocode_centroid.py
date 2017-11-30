import geocoder
import pandas as pd

df = pd.read_csv('housingchanges.csv',usecols=['neighbourhood'])

chi = lambda x: x + ', Chicago'
geoc = lambda x: geocoder.google(x).latlng

df['neighbourhood_concat'] = df['neighbourhood'].apply(chi)
df['centroid'] = df['neighbourhood'].apply(geoc)

df.set_index('neighbourhood',inplace=True)

df.to_csv('centroids.csv',index_label='region')
