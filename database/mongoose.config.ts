import { ConfigService } from "@nestjs/config";

export function mongooseConfigFactory(config: ConfigService) {
  // Prefer explicit full connection string if provided
  const fullUri =
    config.get<string>("MONGODB_URI") || config.get<string>("MONGO_URI");
  if (fullUri) return { uri: fullUri };

  // Build from components for flexibility in different environments
  const user = encodeURIComponent(config.get<string>("MONGO_USER") || "");
  const pass = encodeURIComponent(config.get<string>("MONGO_PASS") || "");
  const host = config.get<string>("MONGO_HOST") || "localhost:27017";
  const db = config.get<string>("MONGO_DB") || "test";
  const options = config.get<string>("MONGO_OPTIONS") || "";

  const credentials = user || pass ? `${user}:${pass}@` : "";

  // If host looks like a SRV host (no port), use mongodb+srv, otherwise use mongodb
  const useSrv = !host.includes(":");
  const protocol = useSrv ? "mongodb+srv" : "mongodb";

  const query = options
    ? options.startsWith("?")
      ? options
      : `?${options}`
    : "";
  const uri = `${protocol}://${credentials}${host}/${db}${query}`;
  return { uri };
}

export default mongooseConfigFactory;
