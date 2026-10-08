from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('apps')

def custom_exception_handler(exc, context):
    """
    Standardize all API error responses in accordance with specification Section 156.
    Format:
    {
        "error": {
            "code": "ERROR_CODE",
            "message": "Human-friendly explanation",
            "details": {...}
        }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_payload = {
            'error': {
                'code': exc.__class__.__name__.upper(),
                'message': 'An error occurred while processing your request.',
                'status_code': response.status_code,
                'details': response.data
            }
        }

        # Provide friendly top-level message if detail string exists
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_payload['error']['message'] = str(response.data['detail'])
            elif 'message' in response.data:
                error_payload['error']['message'] = str(response.data['message'])
        elif isinstance(response.data, list) and len(response.data) > 0:
            error_payload['error']['message'] = str(response.data[0])

        response.data = error_payload
    else:
        logger.exception("Unhandled server exception: %s", str(exc))
        # Handle unhandled 500 error gracefully without leaking stack trace
        response = Response(
            {
                'error': {
                    'code': 'INTERNAL_SERVER_ERROR',
                    'message': 'An unexpected server error occurred. Please try again later.',
                    'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
