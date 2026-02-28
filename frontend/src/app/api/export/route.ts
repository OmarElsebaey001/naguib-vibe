import { NextResponse } from "next/server";
import JSZip from "jszip";
import { buildExportProject } from "@/lib/export/build-project";
import { PageConfigSchema } from "@/lib/schemas/page-config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PageConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid page config", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const config = parsed.data;
    const files = await buildExportProject(config);

    // Build zip
    const zip = new JSZip();
    const folderName =
      config.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "landing-page";

    for (const [filepath, content] of files) {
      zip.file(`${folderName}/${filepath}`, content);
    }

    const zipBuffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new Response(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${folderName}.zip"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json(
      { error: "Export failed", message: String(err) },
      { status: 500 }
    );
  }
}
