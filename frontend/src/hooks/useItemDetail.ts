/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import { getItem, getItemReviews, type ItemDetail, type Review } from '../api/items'

export type ItemDetailState =
    | { status: 'loading' }
    | { status: 'notFound' }
    | { status: 'error' }
    | { status: 'ready'; item: ItemDetail; reviews: Review[] }

/** Loads one item and its reviews. Re-runs when the id changes. */
export function useItemDetail(id: string | undefined): ItemDetailState {
    const [state, setState] = useState<ItemDetailState>({ status: 'loading' })

    useEffect(() => {
        if (!id) {
            setState({ status: 'notFound' })
            return
        }

        let cancelled = false
        setState({ status: 'loading' })

        Promise.all([getItem(id), getItemReviews(id)])
            .then(([item, reviews]) => {
                if (cancelled) return
                setState(item ? { status: 'ready', item, reviews } : { status: 'notFound' })
            })
            .catch(() => {
                if (!cancelled) setState({ status: 'error' })
            })

        return () => {
            cancelled = true
        }
    }, [id])

    return state
}