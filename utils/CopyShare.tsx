import { toast } from 'react-toastify';

export default async function CopyShare(text) {
    try {
        await navigator.clipboard.writeText(text)
        toast.success('Link copied to clipboard')
    } catch (err) {
        console.error('Failed to copy, please try again.', err)
        toast.error('Failed to copy, please try again.')
    }
}