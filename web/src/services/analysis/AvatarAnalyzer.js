/**
 * Avatar Analyzer
 * Analyzes VRM models and generates improvement suggestions
 */

class AvatarAnalyzer {
    constructor() {
        this.lastAnalysis = null;
    }

    /**
     * Analyze VRM model
     */
    analyze(vrmModel) {
        if (!vrmModel) {
            return {
                hasAvatar: false,
                error: 'No avatar loaded'
            };
        }

        const result = {
            hasAvatar: true,
            meshCount: 0,
            polyCount: 0,
            vertexCount: 0,
            materialCount: 0,
            materials: [],
            hasStandardMaterial: false,
            hasTextureMaps: false,
            textureTypes: [],
            boneCount: 0,
            bones: [],
            timestamp: new Date().toISOString()
        };

        const materials = new Set();
        const textureTypes = new Set();

        // Analyze scene
        vrmModel.scene.traverse((obj) => {
            if (obj.isMesh) {
                result.meshCount++;

                // Geometry analysis
                const geom = obj.geometry;
                if (geom) {
                    if (geom.index) {
                        result.polyCount += geom.index.count / 3;
                    } else if (geom.attributes && geom.attributes.position) {
                        result.polyCount += geom.attributes.position.count / 3;
                    }

                    if (geom.attributes && geom.attributes.position) {
                        result.vertexCount += geom.attributes.position.count;
                    }
                }

                // Material analysis
                const mat = obj.material;
                if (mat) {
                    if (Array.isArray(mat)) {
                        mat.forEach(m => materials.add(m));
                    } else {
                        materials.add(mat);
                    }
                }
            }

            // Bone analysis
            if (obj.isBone) {
                result.boneCount++;
                result.bones.push(obj.name);
            }
        });

        // Material details
        materials.forEach((m) => {
            result.materials.push({
                name: m.name || 'Unnamed',
                type: m.type
            });

            if (m.isMeshStandardMaterial || m.type === 'MeshStandardMaterial') {
                result.hasStandardMaterial = true;
            }

            // Texture maps
            if (m.map) {
                result.hasTextureMaps = true;
                textureTypes.add('baseColor');
            }
            if (m.normalMap) {
                result.hasTextureMaps = true;
                textureTypes.add('normal');
            }
            if (m.roughnessMap) {
                result.hasTextureMaps = true;
                textureTypes.add('roughness');
            }
            if (m.metalnessMap) {
                result.hasTextureMaps = true;
                textureTypes.add('metalness');
            }
            if (m.emissiveMap) {
                result.hasTextureMaps = true;
                textureTypes.add('emissive');
            }
        });

        result.materialCount = materials.size;
        result.textureTypes = Array.from(textureTypes);
        result.polyCount = Math.round(result.polyCount);

        this.lastAnalysis = result;
        return result;
    }

    /**
     * Generate improvement suggestions based on analysis
     */
    generateSuggestions(analysis) {
        if (!analysis || !analysis.hasAvatar) {
            return ['No avatar loaded. Load an avatar to analyze.'];
        }

        const suggestions = [];

        // Geometry suggestions
        if (analysis.polyCount < 5000) {
            suggestions.push(
                `🔺 Low poly count (${analysis.polyCount}): Consider adding more detail to face and hands for better realism.`
            );
        } else if (analysis.polyCount > 50000) {
            suggestions.push(
                `⚠️ High poly count (${analysis.polyCount}): May cause performance issues. Consider optimizing mesh.`
            );
        } else {
            suggestions.push(
                `✅ Poly count (${analysis.polyCount}) is good for browser performance.`
            );
        }

        // Material suggestions
        if (!analysis.hasStandardMaterial) {
            suggestions.push(
                `💡 No PBR materials detected: Re-export with MeshStandardMaterial for better lighting.`
            );
        }

        if (!analysis.hasTextureMaps) {
            suggestions.push(
                `🎨 No texture maps found: Add baseColor, normal, and roughness maps for realism.`
            );
        } else {
            const missing = [];
            if (!analysis.textureTypes.includes('normal')) missing.push('normal');
            if (!analysis.textureTypes.includes('roughness')) missing.push('roughness');

            if (missing.length > 0) {
                suggestions.push(
                    `📦 Missing texture maps: ${missing.join(', ')}. Add these for better material quality.`
                );
            } else {
                suggestions.push(
                    `✅ Good texture setup: ${analysis.textureTypes.join(', ')} maps detected.`
                );
            }
        }

        // Bone suggestions
        if (analysis.boneCount > 0) {
            suggestions.push(
                `🦴 Bone count: ${analysis.boneCount}. Procedural motion is active on all bones.`
            );
        }

        // Mesh optimization
        if (analysis.meshCount > 20) {
            suggestions.push(
                `🔧 High mesh count (${analysis.meshCount}): Consider merging meshes to improve performance.`
            );
        }

        return suggestions;
    }

    /**
     * Get last analysis
     */
    getLastAnalysis() {
        return this.lastAnalysis;
    }
}

export const avatarAnalyzer = new AvatarAnalyzer();
