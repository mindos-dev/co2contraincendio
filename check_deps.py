import sys
results = []
try:
    import fastapi
    results.append(f"fastapi {fastapi.__version__} OK")
except Exception as e:
    results.append(f"fastapi ERRO: {e}")

try:
    import uvicorn
    results.append(f"uvicorn OK")
except Exception as e:
    results.append(f"uvicorn ERRO: {e}")

try:
    import fitz
    results.append(f"pymupdf (fitz) {fitz.version[0]} OK")
except Exception as e:
    results.append(f"pymupdf ERRO: {e}")

try:
    import ezdxf
    results.append(f"ezdxf {ezdxf.__version__} OK")
except Exception as e:
    results.append(f"ezdxf ERRO: {e}")

try:
    import reportlab
    results.append(f"reportlab {reportlab.__version__} OK")
except Exception as e:
    results.append(f"reportlab ERRO: {e}")

try:
    import multipart
    results.append(f"python-multipart OK")
except Exception as e:
    results.append(f"python-multipart ERRO: {e}")

for r in results:
    print(r)
print("VERIFICACAO CONCLUIDA")
