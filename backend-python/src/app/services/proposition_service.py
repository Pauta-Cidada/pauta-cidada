from typing import Optional, List, Dict, Any
from pathlib import Path
import os
import json
from google.cloud import bigquery
from google.oauth2 import service_account
from app.models.proposition import Proposition

class PropositionService:
    def list_propositions(
        self,
        keywords: Optional[str] = None,
        uf: Optional[str] = None,
        type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        
        # Construct path to SQL file
        base_path = Path(__file__).resolve().parent.parent
        sql_path = base_path / "queries" / "get_propositions.sql"
        
        if not sql_path.exists():
             raise FileNotFoundError(f"Query file not found at {sql_path}")

        with open(sql_path, "r") as f:
            query = f.read()
            
        # Add filters
        if keywords:
            safe_keywords = keywords.replace("'", "''")
            query += f"\nAND LOWER(palavra_chave) LIKE '%{safe_keywords.lower()}%'"
            
        if uf:
            safe_uf = uf.replace("'", "''")
            query += f"\nAND autor.sigla_uf_autor = '{safe_uf}'"
            
        if type:
            safe_type = type.replace("'", "''")
            query += f"\nAND prop.sigla = '{safe_type}'"
            
        query += "\nORDER BY ano DESC\nLIMIT 20"
        
        # Execute query using BigQuery Client with credentials from .env
        billing_project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        
        if not billing_project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set")
        
        # Try to get credentials from JSON env var first, fallback to file path
        if credentials_json:
            try:
                credentials_info = json.loads(credentials_json)
                credentials = service_account.Credentials.from_service_account_info(credentials_info)
                client = bigquery.Client(project=billing_project_id, credentials=credentials)
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format: {e}")
        else:
            # Fallback to file path (GOOGLE_APPLICATION_CREDENTIALS env var)
            client = bigquery.Client(project=billing_project_id)
        
        query_job = client.query(query)
        results = query_job.result()
        
        # Convert to list of dicts
        rows = [dict(row) for row in results]
        
        # Handle potential serialization issues
        final_results = []
        for row in rows:
            # Convert dates/datetimes to string
            for key, value in row.items():
                if hasattr(value, 'isoformat'):
                    row[key] = value.isoformat()
            final_results.append(row)
        
        return final_results
