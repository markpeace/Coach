# Coach Action authentication

Package version: 0.1.0

Configure the Custom GPT Action with API key authentication:

- Authentication type: API key
- Auth type: Bearer
- Header: `Authorization`
- Secret value: the runtime `GPT_ACTION_API_KEY`

The key is separate from the household web passphrase. Do not place either secret in this repository or in the OpenAPI document.

Every athlete-specific operation must still include `athleteId`. The bearer credential authenticates the shared Coach GPT service; it does not select an athlete.
