import { CanvasTexture, Color, NearestFilter, RepeatWrapping, Texture, Uniform } from 'three';
import { Effect } from 'postprocessing';

const fragment = `
uniform sampler2D uCharacters;
uniform float uCharactersCount;
uniform float uCellSize;
uniform float uBlockSize;
uniform bool uInvert;
uniform vec3 uColor;
uniform vec3 uColorArray[4];
uniform bool uUseColorArray;
uniform bool uUseOriginalColors;
uniform float uBrightness;
uniform bool uDisabled;
uniform vec3 uBackgroundColor;
uniform float uCharacterAspectRatioX;
uniform float uCharacterAspectRatioY;


const vec2 SIZE = vec2(16.);

vec3 greyscale(vec3 color, float strength) {
    float g = dot(color, vec3(0.299, 0.587, 0.114) * uBrightness);
    return mix(color, vec3(g), strength);
}

vec3 greyscale(vec3 color) {
    return greyscale(color, 1.0);
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
// Add an effect toggle //
    if(uDisabled){
        outputColor = texture2D(inputBuffer,uv);
        return;
    }

    vec2 cell = resolution / uCellSize;
    cell.x = cell.y * uCharacterAspectRatioX;
    vec2 grid = uBlockSize / cell;
    vec2 pixelizedUV = grid * (0.5 + floor(uv / grid));
    vec4 pixelized = texture2D(inputBuffer, pixelizedUV);
    float greyscaled = greyscale(pixelized.rgb).r;

    if (uInvert) {
        greyscaled = 1.0 - greyscaled;
    }

    float characterIndex = floor((uCharactersCount - 1.0) * greyscaled);
    vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
    vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
    vec2 charUV = mod(uv * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
    vec4 asciiCharacter = texture2D(uCharacters, charUV);

//Allow custom colors in an Array or Singular. Pass through original texture to drive coloring. 
    vec3 selectedColor = uColor;
    int colorIndex = int(floor(greyscaled * float(4))); // Calculate the index for the color array
    selectedColor = uColorArray[colorIndex]; // Get the color from the color array

    if(uUseColorArray){
        asciiCharacter.rgb = selectedColor * asciiCharacter.r;
    } else if (uUseOriginalColors){
        selectedColor = pixelized.rgb;
        asciiCharacter.rgb = selectedColor * asciiCharacter.r;
    }else{
        asciiCharacter.rgb = uColor * asciiCharacter.r;

    }

    //set bg color
    asciiCharacter.rgb = mix(uBackgroundColor, asciiCharacter.rgb, asciiCharacter.a);
    
    asciiCharacter.a = pixelized.a;
    outputColor = asciiCharacter;
}
`;

export interface IASCIIEffectProps {
    characters?: string;
    fontSize?: number;
    cellSize?: number;
    blockSize?: number;
    fgColor?: string;
    invert?: boolean;
    colorArray?: string[];
    bgColor?: string;
    useColorArray?: boolean;
    useOriginalColors?: boolean;
    brightness?: number;
    charAspectRatio?: number;
    disabled?: boolean;
}

export class ASCIIEffect extends Effect {
    constructor({
        characters = ` .,'^:-=+*?!|0%#XWM@`,
        fontSize = 54,
        cellSize = 16,
        blockSize = 1,
        bgColor = '#000000',
        fgColor = '#ffffff',
        useColorArray = false,
        colorArray = ['#462255', '#313b72', '#62a87c', '#7ee081', '#c3f3c0'],
        invert = false,
        useOriginalColors = true,
        brightness = 1,
        charAspectRatio = 1,
        disabled = false
    }: IASCIIEffectProps = {}) {
        const uniforms = new Map<string, Uniform>([
            ['uCharacters', new Uniform(new Texture())],
            ['uCellSize', new Uniform(cellSize)],
            ['uBlockSize', new Uniform(blockSize)],
            ['uCharactersCount', new Uniform(characters.length)],
            ['uColor', new Uniform(new Color(fgColor))],
            ['uBackgroundColor', new Uniform(new Color(bgColor))],
            ['uColorArray', new Uniform(colorArray.map(color => new Color(color)))],
            ['uUseColorArray', new Uniform(useColorArray)],
            ['uInvert', new Uniform(invert)],
            ['uUseOriginalColors', new Uniform(useOriginalColors)],
            ['uBrightness', new Uniform(brightness)],
            ['uCharacterAspectRatioX', new Uniform(charAspectRatio)],
            ['uDisabled', new Uniform(disabled)]
        ]);

        super('ASCIIEffect', fragment, { uniforms });

        const charactersTextureUniform = this.uniforms.get('uCharacters');

        if (charactersTextureUniform) {
            charactersTextureUniform.value = this.createCharactersTexture(characters, fontSize);
        }
    }

    /** Draws the characters on a Canvas and returns a texture */
    public createCharactersTexture(characters: string, fontSize: number): THREE.Texture {
        const canvas = document.createElement('canvas');

        const SIZE = 1024;
        const MAX_PER_ROW = 16;
        const CELL = SIZE / MAX_PER_ROW;

        canvas.width = canvas.height = SIZE;

        const texture = new CanvasTexture(
            canvas,
            undefined,
            RepeatWrapping,
            RepeatWrapping,
            NearestFilter,
            NearestFilter
        );

        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Context not available');
        }

        context.clearRect(0, 0, SIZE, SIZE);
        context.font = `${fontSize}px consolas, monospace`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#fff';

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];
            const x = i % MAX_PER_ROW;
            const y = Math.floor(i / MAX_PER_ROW);

            context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2);
        }

        texture.needsUpdate = true;

        return texture;
    }
}
