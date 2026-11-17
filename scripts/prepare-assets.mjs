import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.resolve(root, "..");
for (const dir of ["models", "images", "textures", "draco"]) await mkdir(path.join(root, "public", dir), { recursive: true });
await copyFile(path.join(source, "villa_bellavista_web.glb"), path.join(root, "public/models/villa-bellavista.glb"));
for (const [from, to] of [["villa_bellavista_preview.png", "villa-hero.webp"], ["villa_bellavista_detail.png", "villa-detail.webp"]]) {
  await sharp(path.join(source, from)).webp({ quality: 88 }).toFile(path.join(root, "public/images", to));
}
for (const file of ["draco_decoder.wasm", "draco_wasm_wrapper.js", "draco_decoder.js"]) {
  await copyFile(path.join(root, "node_modules/three/examples/jsm/libs/draco/gltf", file), path.join(root, "public/draco", file));
}
const glb = await readFile(path.join(root, "public/models/villa-bellavista.glb"));
if (glb.readUInt32LE(0) !== 0x46546c67 || glb.readUInt32LE(8) !== glb.length) throw new Error("Invalid GLB");
const jsonLength = glb.readUInt32LE(12);
const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString("utf8"));
const binaryStart = 20 + jsonLength + 8;
for (const [needle, out] of [["White mineral plaster", "plaster.webp"], ["Honed grey limestone", "stone.webp"]]) {
  const image = json.images.find((i) => i.name?.includes(needle) && i.name?.includes("Albedo"));
  if (!image) throw new Error(`Missing texture ${needle}`);
  const view = json.bufferViews[image.bufferView];
  const bytes = glb.subarray(binaryStart + (view.byteOffset ?? 0), binaryStart + (view.byteOffset ?? 0) + view.byteLength);
  await sharp(bytes).webp({ quality: 88 }).toFile(path.join(root, "public/textures", out));
}
await writeFile(path.join(root, "public/models/asset-info.json"), JSON.stringify({
  name: "Villa Bellavista", bytes: glb.length, meshes: json.meshes.length,
  images: json.images.length, requiredExtensions: json.extensionsRequired,
  palette: "white and grey", source: "Original Blender model created for this project",
}, null, 2));
console.log(`Prepared villa assets: ${glb.length} bytes, ${json.meshes.length} meshes, ${json.images.length} embedded images.`);
