# Instalación de IvysCode

## macOS / Linux (curl)

```bash
curl -fsSL https://raw.githubusercontent.com/JustinLeoni/ivys/main/install | bash
```

Con versión específica:

```bash
curl -fsSL https://raw.githubusercontent.com/JustinLeoni/ivys/main/install | bash -s -- --version v2.0.31
```

## Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/JustinLeoni/ivys/main/install.ps1 | iex
```

## Notas

- El comando de la CLI es `ivys` (por ejemplo `ivys --version`, `ivys --help`).
- El producto se llama **IvysCode**; el binario y el config separado viven en `~/.ivys` (`~/.config/ivys`).
- IvysCode consume los mismos modelos/proveedores que OpenCode.
- Los binarios se publican como assets de GitHub Releases del repo `JustinLeoni/ivys`
  (`ivys-<os>-<arch>.tar.gz` en macOS/Linux y `ivys-windows-<arch>.zip` en Windows).
