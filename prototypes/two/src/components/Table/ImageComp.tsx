import React, { useEffect, useState } from "react";
import { height, paint, width } from "../../image";
import { Image } from "../../image-definitions";

interface Props {
    image: Image
    key: number
}

export const ImageComp:React.FC<Props> = ({ image }) => {

    const [isOpen, changeIsOpen] = useState<boolean>(false);

    /**
     * changes isOpen state to false if the image Prop changes
     * this can happen when the input or the formula is changed
     */
    useEffect(() => {
        changeIsOpen(false);
    }, [image]);
    
    /**
     * handles the click on an image
     * if the image isZoomable, isOpen state is flipped
     * @param image the clicked on image
     */
    const handleViewClick = (image:Image) => {
        if (isZoomable(image)) {
            changeIsOpen(!isOpen);
        }
    }

    /**
     * determines whether the given image is larger than set dimensions
     * @param image the image to test
     * @returns boolean
     */
    const isZoomable = (image:Image) => {
        return (height(image) > 250 || width(image) > 250);
    }

    // TODO: isntead of a dialog pop-up, blur out everything behind enlarged image
    // if isOpen state is true, then dialog box is open with full size picture
    // else, image is rendered at scaled size
    return (
        <div className={isZoomable(image) ? 'image-output' : 'output'} onClick={() => handleViewClick(image)} >
                    {paint(image, true)}
                    {isOpen && (
                        <dialog
                            style={{ position: "absolute", cursor: "zoom-out" }}
                            open
                            onClick={() => handleViewClick(image)}
                        >
                            {paint(image)}
                        </dialog>
                    )}
        </div>
    )

}