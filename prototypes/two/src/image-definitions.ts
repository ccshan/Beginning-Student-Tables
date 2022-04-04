
interface Color {
    r: number
    g: number
    b: number
    a: number
}

interface Circle {
    r: number
    color: Color
    mode: string
    type: 'circle'

}

interface Rectangle {
    width: number
    height: number
    color: Color
    mode: string
    type: 'rect'
}

interface Triangle {
    A: number
    B: number
    C: number
    color: Color
    mode: string
    type: 'triangle'
}

interface Beside {
    type: 'beside'
    yplaces: string
    images: ImageArray
}

interface Above {
    type: 'above'
    xplace: string
    images: ImageArray
}

interface Overlay {
    type: 'overlay'
    yplace: string
    xplace: string
    images: ImageArray
}

interface TextImage {
    t: string
    size: number
    color: Color
    type: 'text'
}

type ImageArray = Array<Image>;

type Image = Circle | Rectangle | Triangle | Beside | Above | Overlay | TextImage;

export type { Image };