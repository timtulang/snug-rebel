import { apiFetch } from "../api/api";

/*
 * Data layer for the item page.
 *
 * Everything the page needs comes from the two async functions at the bottom, and the types
 * below describe the shape the backend should return. To connect the real API, replace the
 * bodies of getItem() and getItemReviews() with fetch calls (return null from getItem when
 * the server answers 404). Nothing else in the UI needs to change.
 */

export type ItemColor = { name: string; hex: string }
export type ItemSize = { label: string; available: boolean }

export type ItemDetail = {
    id: string
    name: string
    description: string
    imageSrc: string
    price: number
    salePrice?: number
    rating: number
    reviewCount: number
    soldCount: number
    /** Units in stock. 0 disables buying. Also caps the quantity stepper. */
    stock: number
    colors: ItemColor[]
    sizes: ItemSize[]
}

export type Review = {
    id: string
    author: string
    /** 0 to 5, halves allowed (e.g. 2.5). */
    rating: number
    body: string
    /** ISO date format (e.g. "2023-08-14"). */
    postedAt: string
    verified: boolean
}

// ---------------------------------------------------------------------------------------------
// Mock data.
// ---------------------------------------------------------------------------------------------

const MOCK_REVIEWS: Review[] = [
    {
        id: 'r1',
        author: 'Samantha D.',
        rating: 4.5,
        body: 'The drape on this shirt is insane. The heavyweight cotton actually feels premium, not just thick and stiff like other streetwear brands. The drop-shoulder cut gives it that perfect slouchy look without feeling like a tent.',
        postedAt: '2023-08-14',
        verified: true,
    },
    {
        id: 'r2',
        author: 'Alex M.',
        rating: 4,
        body: 'Finally, an oversized tee that doesn’t swallow me whole! The slightly cropped length balances out the wide shoulders perfectly. It’s edgy, stupidly comfortable, and feels way more expensive than it is.',
        postedAt: '2023-08-15',
        verified: true,
    },
    {
        id: 'r3',
        author: 'Reinbrant M.',
        rating: 4,
        body: 'Maganda po haha. Bili po ulit ako next sahod ko kasi sobrang worth it talaga at totoong komportable siya. Perfect ito para sa mga 24 year old like me.',
        postedAt: '2023-08-15',
        verified: true,
    },
    {
        id: 'r4',
        author: 'Ethan R.',
        rating: 3.5,
        body: 'Snug Rebel nailed it. I practically live in this tee now. It’s incredibly soft (seriously buttery), and the tonal embroidery on the chest is super subtle. It looks great layered under my denim jacket or just on its own.',
        postedAt: '2023-08-16',
        verified: true,
    },
    {
        id: 'r5',
        author: 'Choco B.',
        rating: 4,
        body: 'I bought this dahil ang pretty ng model! Love ko kung paano niya dalhin yung clothes hehe talagang mapapabili ka! Okay din yung tela kaso sana next time magkaron na kayo ng pouch hehe.',
        postedAt: '2023-08-17',
        verified: true,
    },
    {
        id: 'r6',
        author: 'Lacongan E.',
        rating: 4,
        body: 'Aray kooooOOoo!! Ang ganda men sobra!! Ang lambot pa ng tela talagang mapapa ooh lala ka sa lambot! Very nice ha perfect to for everyday din.',
        postedAt: '2023-08-17',
        verified: true,
    },
    {
        id: 'r7',
        author: 'Liam K.',
        rating: 4,
        body: 'Really dope shirt. The GSM fabric feels substantial and hangs perfectly. Deducting one star just because the raw hem curls up a tiny bit after the first wash, but honestly, it kind of adds to the distressed vibe.',
        postedAt: '2023-08-18',
        verified: true,
    },
    {
        id: 'r8',
        author: 'Kristal DC.',
        rating: 4.5,
        body: 'The fabric is so nice and comfy. Hindi siya mainit so okay din siya isuot kahit mainit. This is perfect for teenagers like me kasi na-eexpress ko pa rin yung sarili kong style despite the ph weather. ;)',
        postedAt: '2023-08-19',
        verified: true,
    },
    {
        id: 'r9',
        author: 'Timothy T.',
        rating: 4.5,
        body: 'Deymmmmmm!! Cool brooo! Mas okay to kaysa sa iba kong na-buy na clothes kasi it’s comfy and perfect for cafe hangouts. It’s not hot din pag sinuot kaya okay sa mga youngsters like me.',
        postedAt: '2023-08-19',
        verified: true,
    },
]

const simulateNetwork = () => new Promise((resolve) => setTimeout(resolve, 150))

// ---------------------------------------------------------------------------------------------
// The API the UI uses
// ---------------------------------------------------------------------------------------------

/** One item by id. Resolves to null when it doesn't exist. */
export async function getItem(
  id: string
): Promise<ItemDetail | null> {
  try {
    return await apiFetch<ItemDetail>(
      `/Product/GetProductByID/${encodeURIComponent(id)}`
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("404")
    ) {
      return null;
    }

    throw error;
  }
}

/** Reviews for one item, newest last (the page shows them in the order returned). */
export async function getItemReviews(_id: string): Promise<Review[]> {
    await simulateNetwork()
    return MOCK_REVIEWS
}