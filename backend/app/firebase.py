import firebase_admin
from firebase_admin import credentials,firestore, auth
from app.config import settings

import os
import json
import time
from datetime import datetime, timezone

firebase_json = os.getenv("FIREBASE_KEY_JSON")

print("DEMO MODE: Activating Tactical MockDB (Bypassing Google Quota)...")
if True:
    # Stateful MockDB for local testing
    class MockFirestore:
        def __init__(self): 
            self._collections = {}
            self.load_from_disk()
        def collection(self, name):
            if name not in self._collections: self._collections[name] = MockCollection(name, self)
            return self._collections[name]
        def transaction(self):
            class MockTransaction:
                def update(self, ref, data): ref.update(data)
                def get(self, ref, transaction=None): return ref.get()
            return MockTransaction()
        def save_to_disk(self):
            try:
                dump = {name: {id: doc._data for id, doc in coll._docs.items()} for name, coll in self._collections.items()}
                with open("mock_db.json", "w") as f: json.dump(dump, f, default=str)
            except: pass
        def load_from_disk(self):
            try:
                if os.path.exists("mock_db.json"):
                    with open("mock_db.json", "r") as f:
                        data = json.load(f)
                        for coll_name, docs in data.items():
                            coll = MockCollection(coll_name, self)
                            for doc_id, doc_data in docs.items():
                                coll._docs[doc_id] = MockDoc(doc_id, doc_data)
                            self._collections[coll_name] = coll
            except: pass

    class MockCollection:
        def __init__(self, name, parent): 
            self.name = name
            self.parent = parent
            self._docs = {}
        def document(self, id=None): 
            if not id: import uuid; id = str(uuid.uuid4())
            if id not in self._docs: self._docs[id] = MockDoc(id)
            return self._docs[id]
        def stream(self): 
            import time
            from datetime import datetime, timezone
            all_docs = []
            for doc in self._docs.values():
                data = doc.to_dict()
                if data.get("status") == "resolved" and "resolved_at" in data:
                    try:
                        res_at = data["resolved_at"]
                        if isinstance(res_at, datetime): res_ts = res_at.timestamp()
                        else: res_ts = time.time() - 10
                        if time.time() - res_ts > 120: continue # 2 min window for demo
                    except: pass
                all_docs.append(doc)
            return all_docs
        def set(self, data):
            id = data.get("id") or str(len(self._docs))
            self._docs[id] = MockDoc(id, data)
            self.parent.save_to_disk()

    class MockDoc:
        def __init__(self, id, data=None): 
            self.id = id
            self._data = data or {}
        def to_dict(self): return self._data
        def set(self, data, merge=False): 
            if merge: self._data.update(data)
            else: self._data = data
        def update(self, data): 
            self._data.update(data)
        def get(self): 
            class DocSnapshot:
                def __init__(self, exists, data, id):
                    self.exists = exists; self._data = data; self.id = id
                def to_dict(self): return self._data
            return DocSnapshot(bool(self._data), self._data, self.id)
    db = MockFirestore()

firebase_auth = auth
