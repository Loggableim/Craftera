# Package Storage (AP-15.9)

## Ziel

Die Speicherung von Package-Archiven ist über eine **abstrakte Schnittstelle**
entkoppelt, damit im Produktivbetrieb eine objektbasierte Speicherung
(Cloudflare R2 / S3 / CDN) eingesetzt werden kann, ohne den Server-Code zu
ändern.

## Schnittstelle

`platform/storage/packageStorage.js` — `PackageStorage` (abstrakt):

| Methode | Beschreibung |
|---------|--------------|
| `put(packageId, archive)` | Speichert ein Package-Archiv. |
| `get(packageId)` | Lädt ein Package-Archiv (oder `null`). |
| `exists(packageId)` | Prüft, ob ein Package existiert. |

## Lokale Implementierung

`platform/storage/localPackageStorage.js` — `LocalPackageStorage`:
Speichert Archive als JSON-Dateien unter `<dataDir>/uploads/<packageId>.json`.

Der `RemoteRegistryServer` nutzt diese Schnittstelle über `this.packageStorage`.

## Erweiterung für CDN/R2

Für den Produktivbetrieb eine neue Klasse implementieren, die `PackageStorage`
erweitert, z.B. `R2PackageStorage` mit Cloudflare R2-Bindings:

```js
class R2PackageStorage extends PackageStorage {
  async put(packageId, archive) {
    await this.bucket.put(`${packageId}.json`, JSON.stringify(archive));
    return { packageId, uploaded: true };
  }
  async get(packageId) {
    const obj = await this.bucket.get(`${packageId}.json`);
    return obj ? JSON.parse(await obj.text()) : null;
  }
  async exists(packageId) {
    return (await this.bucket.get(`${packageId}.json`)) !== null;
  }
}
```

Dann im Server-Constructor austauschen:

```js
this.packageStorage = new R2PackageStorage(env.BUCKET);
```

## Voraussetzungen für R2

- Cloudflare-Konto mit R2-Bucket.
- Worker-Binding `BUCKET` im `wrangler.toml`.
- Derzeit ist der Cloudflare-API-Token ungültig (HTTP 9109 Unauthorized),
  daher ist die R2-Implementierung vorbereitet, aber noch nicht deployt.
