from pymongo import MongoClient, ASCENDING
from pymongo.errors import OperationFailure
import time

# Connect to MongoDB
client = MongoClient('mongodb+srv://admin:awesome@cluster0.kzdrfb1.mongodb.net/')
db = client['sample_mflix']
collection = db['movies']

# Ensure collection is indexed to optimize $skip and $limit operations
try:
    collection.create_index([('_id', ASCENDING)])
except OperationFailure as e:
    print(f"Index creation failed: {e}")

def flatten_document(doc, parent_key='', sep='.'):
    """
    Flatten a dictionary preserving nested keys.
    """
    items = []
    for k, v in doc.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_document(v, new_key, sep=sep).items())
        else:
            items.append((new_key, type(v).__name__))
    return dict(items)

# Process documents in batches
total_documents = collection.count_documents({})
batch_size = 1000
field_type_counts = {}

for i in range(0, total_documents, batch_size):
    # Start time for the current iteration
    start_time = time.time()

    cursor = collection.find({}, {'_id': 0}).skip(i).limit(batch_size)
    batch_docs = list(cursor)
    
    for doc in batch_docs:
        flattened_doc = flatten_document(doc)
        for field, field_type in flattened_doc.items():
            field_type_pair = (field, field_type)
            if field_type_pair in field_type_counts:
                field_type_counts[field_type_pair] += 1
            else:
                field_type_counts[field_type_pair] = 1

    # End time for the current iteration
    end_time = time.time()
    iteration_time = end_time - start_time
    print(f"Time taken for batch starting at {i}: {iteration_time:.2f} seconds")

# Calculate field-type percentages and apply threshold
threshold = 0
threshold_field_types = []

for field_type, count in field_type_counts.items():
    percentage = count / total_documents
    if percentage >= threshold:
        threshold_field_types.append(field_type)

print("Field-type pairs:")
print(threshold_field_types)
