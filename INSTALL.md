# Instalación de Ivys

## macOS / Linux (curl)

```bash
curl -fsSL https://raw.githubusercontent.com/Justin20083/ivys/main/install | bash
```

Con versión específica:

```bash
curl -fsSL https://raw.githubusercontent.com/Justin20083/ivys/main/install | bash -s -- --version v2.0.30
```

## Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/Justin20083/ivys/main/install.ps1 | iex
```

## Notas

- Ivys usa configuración separada (`~/.config/ivys`) pero consume los mismos modelos/proveedores que OpenCode.
- Los binarios se publican como assets de GitHub Releases del repo `Justin20083/ivys`.
