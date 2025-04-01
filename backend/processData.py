import os
import pandas as pd


file_path = ("dataset.csv")

df = pd.read_csv(file_path)

print(df.head())
print (df.columns )
# print (df.sample(15))
#language column has en so filter for en
df = df[df['language'] == 'en']
# print(df.sample(15))
#empty/nearly empty colums
df = df.drop(columns=[ 'tag_6', 'tag_7','tag_8','tag_9'])
#removes empty rows for places we need
df = df.dropna(subset = ['body', 'answer'])
#resest the order of the hopefully now clean data
df = df.reset_index(drop=True)

print("information on kind of data in the dataset")
print (df.info())

df.to_csv("clean_dataset.csv", index = False)
df.to_json("clean_dataset.json", orient = "records", lines = True)


