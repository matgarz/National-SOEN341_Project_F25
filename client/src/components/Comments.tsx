import { useState } from "react";
import { Item, ItemContent } from "./ui/item";
import { Button } from "./ui/Button";

interface CommentsProps {
    eventId: string;
}

interface Comment {
    text: string;
    userName: string;
    date: string;
}

export function Comments({ eventId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadComments = async () => {
        try {

            const res = await fetch(`/api/events/${eventId}/comments`);

            if (!res.ok) {
                throw new Error(`Failed to load comments (${res.status})`);
            }
            const response = await res.json();
            const comments: Comment[] = response.comments;
            setComments(comments);
            setIsLoaded(true);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="space-y-2">
            {!isLoaded ? (
                <Button onClick={loadComments}>
                    Load comments
                </Button>
            ) : (
                <div>
                    <p className="font-semibold mb-2">Comments:</p>
                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-500">No comments yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {comments.map((comment) => (
                                <Item>
                                    <ItemContent>
                                        <div className="text-sm font-medium">
                                            {comment.userName}
                                        </div>
                                        <div className="text-sm">{comment.text}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(comment.date).toLocaleString()}
                                        </div>
                                    </ItemContent>
                                </Item>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
