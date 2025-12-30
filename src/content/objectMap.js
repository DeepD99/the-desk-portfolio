/**
 * objectMap.js
 * Standardized square blueprint layout. 
 * Updated with new PNG assets.
 */

export const objectMap = [
    {
        id: "obj_headphones",
        label: "HEADPHONES",
        contentKey: "music",
        images: {
            closed: "/images/closed_headphone.png",
            open: "/images/open_headphone.png"
        },
        style: {
            left: "20%",
            top: "50%",
            width: "300px",
            height: "300px"
        }
    },
    {
        id: "obj_laptop",
        label: "LAPTOP",
        contentKey: "work",
        images: {
            closed: "/images/closed_laptop.png",
            open: "/images/open_laptop.png"
        },
        style: {
            left: "40%",
            top: "50%",
            width: "300px",
            height: "300px"
        }
    },
    {
        id: "obj_business_cards",
        label: "BUSINESS CARDS",
        contentKey: "about",
        images: {
            closed: "/images/closed_card.png",
            open: "/images/open_card.png"
        },
        style: {
            left: "60%",
            top: "50%",
            width: "300px",
            height: "300px"
        }
    },
    {
        id: "obj_ps4",
        label: "PS4",
        contentKey: "music",
        images: {
            closed: "/images/ps4.png",
            open: "/images/ps4.png"
        },
        style: {
            left: "80%",
            top: "50%",
            width: "300px",
            height: "300px"
        }
    }
];
