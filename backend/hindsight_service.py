import httpx

HINDSIGHT_URL = "http://127.0.0.1:8984"
BANK_ID = "decisia"


def retain_memory(content: str):
    """
    Store a new memory in Hindsight.
    """

    url = f"{HINDSIGHT_URL}/v1/default/banks/{BANK_ID}/memories"

    payload = {
        "items": [
            {
                "content": content
            }
        ]
    }

    try:
        response = httpx.post(
            url,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPStatusError as error:
        raise RuntimeError(
            f"Hindsight RETAIN failed with HTTP "
            f"{error.response.status_code}: "
            f"{error.response.text}"
        ) from error

    except Exception as error:
        raise RuntimeError(
            f"Hindsight RETAIN connection failed: {str(error)}"
        ) from error


def recall_memory(query: str):
    """
    Search DECISIA memories using Hindsight.
    """

    url = f"{HINDSIGHT_URL}/v1/default/banks/{BANK_ID}/memories/recall"

    payload = {
        "query": query
    }

    try:
        response = httpx.post(
            url,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPStatusError as error:
        raise RuntimeError(
            f"Hindsight RECALL failed with HTTP "
            f"{error.response.status_code}: "
            f"{error.response.text}"
        ) from error

    except Exception as error:
        raise RuntimeError(
            f"Hindsight RECALL connection failed: {str(error)}"
        ) from error


def hindsight_health():
    """
    Check whether the Hindsight daemon is running.
    """

    try:
        response = httpx.get(
            f"{HINDSIGHT_URL}/health",
            timeout=10
        )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPStatusError as error:
        raise RuntimeError(
            f"Hindsight health check failed with HTTP "
            f"{error.response.status_code}: "
            f"{error.response.text}"
        ) from error

    except Exception as error:
        raise RuntimeError(
            f"Hindsight health connection failed: {str(error)}"
        ) from error