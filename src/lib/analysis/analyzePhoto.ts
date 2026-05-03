// src/lib/analysis/analyzePhoto.ts
import type { PhotoFile, PhotoAnalysis } from '@/lib/types';
import { scoreLighting } from './scoreLighting';
import { scoreSharpness } from './scoreSharpness';
import { detectFaces, loadModels } from './detectFaces';
import { scoreEyesOpen } from './scoreEyesOpen';
import { scoreSmiles } from './scoreSmiles';
import { scoreComposition } from './scoreComposition';
import { scoreInstagram } from './scoreInstagram';

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function analyzePhoto(photo: PhotoFile): Promise<PhotoAnalysis> {
  await loadModels();
  const img = await loadImage(photo.url);

  const [lighting, sharpness, faces] = await Promise.all([
    scoreLighting(img),
    scoreSharpness(img),
    detectFaces(img),
  ]);

  const [eyesOpen, smiles, composition] = await Promise.all([
    scoreEyesOpen(faces),
    scoreSmiles(faces),
    scoreComposition(img),
  ]);

  const instagram = await scoreInstagram(lighting, sharpness, eyesOpen, faces.length);

  const tags: string[] = [];
  if (sharpness >= 70) tags.push('sharp');
  if (lighting >= 70) tags.push('bright');
  if (eyesOpen >= 70) tags.push('eyes-open');
  if (smiles >= 70) tags.push('smiling');
  if (faces.length >= 2) tags.push('group');
  if (faces.length === 1) tags.push('solo');
  if (faces.length === 0) tags.push('no-faces');

  const reasonParts: string[] = [];
  if (sharpness >= 70) reasonParts.push('High sharpness');
  else if (sharpness < 40) reasonParts.push('Some blur detected');
  if (lighting >= 70) reasonParts.push('Good exposure');
  else if (lighting < 40) reasonParts.push('Low exposure');
  if (faces.length > 0) {
    reasonParts.push(`${faces.length} face${faces.length > 1 ? 's' : ''} detected`);
    if (eyesOpen >= 70) reasonParts.push('eyes open');
  }
  const reasoning =
    reasonParts.length > 0 ? reasonParts.join(', ') + '.' : 'No notable features detected.';

  // overallScore: equal-weight average across all scores, computed by analyzePhoto.ts
  const overallScore = Math.round(
    lighting * 0.25 + sharpness * 0.25 + eyesOpen * 0.2 + smiles * 0.15 + composition * 0.15
  );

  return {
    photoId: photo.id,
    lighting,
    sharpness,
    faces,
    eyesOpen,
    smiles,
    composition,
    instagram,
    overallScore,
    tags,
    reasoning,
  };
}
