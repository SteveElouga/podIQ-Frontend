// ─────────────────────────────────────────────────────────────────────────────
// Manifests — GraphQL operations
// Centralise toutes les queries et mutations liées au scan de manifests K8s.
// ─────────────────────────────────────────────────────────────────────────────

// ── Mutations ─────────────────────────────────────────────────────────────────

export const SCAN_MANIFEST_MUTATION = `
  mutation ScanManifest($yamlContent: String!, $manifestType: String) {
    scanManifest(yamlContent: $yamlContent, manifestType: $manifestType) {
      riskLevel summary
      risks { severity category description fix }
    }
  }
`;
