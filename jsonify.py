#source: https://stackoverflow.com/questions/38170071/csv-to-json-convertion-with-python

import csv
import json
import random

ROWTYPES = {'regionID': str,
            'neighbourhood': str,
            'jul_13': int,
            'sept_17': int,
            'rawchange': int,
            'pctchange': float,
            'row': int,
            'col':int}

def jsonify_csv(csvfile, jsonfile):
    with open(csvfile) as f:
        reader = csv.DictReader(f)

        jsonfile = open(jsonfile, 'w')
        jsonfile.write('[')
        for row in reader:
            row_converted = {k: ROWTYPES[k](v) for k, v in row.items()}
            json.dump(row_converted, jsonfile)
            jsonfile.write(',\n')
        jsonfile.write(']')
