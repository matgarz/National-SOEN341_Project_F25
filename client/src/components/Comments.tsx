import { useState } from "react";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemHeader,
  ItemMedia,
} from "./ui/item";
import { Button } from "./ui/Button";
import { useAuth } from "../auth/AuthContext";
import { User } from "lucide-react";
import { StarRating } from "./ui/StarRating";
import { ItemText } from "@radix-ui/react-select";

interface CommentsProps {
  eventId: string;
}

interface CommentForm {
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

interface Comment {
  userName: string;
  userRole: string;
  text: string;
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

export function Comments({ eventId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const [form, setForm] = useState<CommentForm>({
    text: "",
    rating: 1,
  });

  const { user } = useAuth();

  const submitComment = async (event: React.FormEvent) => {
    event.preventDefault();
    setAlerts([]);
    if (!user) {
      setAlerts((prev) =>
        prev.concat(
          "Error loading user, consider signing out and logging back in",
        ),
      );
      return;
    }

    const userId = user?.id;
    const text = form.text;

    if (text === "") {
      setAlerts((prev) => prev.concat("text must not be empty"));
      return;
    }

    /*
        if(containsObsceneLanguage(text)){
            setAlerts(prev => prev.concat("comment blocked due to strong language"));
            return;
        }
        * */
    const rating = form.rating;

    try {
      const res = await fetch(`/api/events/${eventId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          text,
          rating,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAlerts((prev) => prev.concat(json.error));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAlerts([message]);
    }

    loadComments();
  };

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/comments`);
      const response = await res.json();
      if (!res.ok) {
        setAlerts((prev) => prev.concat(response.error));
      }
      const comments: Comment[] = response.comments;
      setComments(comments);
      setCommentsLoaded(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setAlerts([message]);
    }
  };

  return (
    <div className="space-y-2 p-6 max-w-3/4">
      {!commentsLoaded ? (
        <Button
          className="flex-1 bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-400 hover:to-gray-500 text-black cursor-pointer hover:bg-primary/10"
          onClick={loadComments}
        >
          Load comments
        </Button>
      ) : (
        <div className="flex flex-col">
          <h1 className="font-semibold mb-2">Comments</h1>
          <form onSubmit={submitComment}>
            <div>
              <textarea
                name="comment"
                value={form.text}
                placeholder="Add a comment ..."
                className="w-full bg-gray-200 rounded-xl p-2 mt-1"
                required
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, text: e.target.value }))
                }
              />
              <br />
              <label style={{ display: "block", marginTop: 12 }}>
                <span
                  style={{ display: "block", fontSize: 13, marginBottom: 4 }}
                >
                  rating
                </span>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      rating: Number(e.target.value) as CommentForm["rating"],
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #ccc",
                  }}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </label>
            </div>

            <div className="text-red-400 py-1">
              {alerts.map((alert, index) => (
                <span key={index} className="py-5">
                  {alert}
                </span>
              ))}
            </div>

            <div className="py-5 flex gap-4">
              <button
                type="submit"
                className=" px-20 rounded bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500  cursor-pointer"
              >
                submit
              </button>
              <button
                type="reset"
                className=" px-20 rounded border-2 border-gray-400 cursor-pointer hover:bg-primary/10 hover:bg-gray-200"
              >
                cancel
              </button>
            </div>
          </form>
          <div className=" gap-4 p-4">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet.</p>
            ) : (
              <div className="space-y-2">
                {comments.map((comment, index) => (
                  <Item key={index} className="bg-gray-300">
                    <ItemHeader>
                      <User className="h-4 w-4" />
                      <div className="text-sm font-medium">
                        {comment.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {comment.userRole}
                      </div>
                    </ItemHeader>
                    <ItemContent>
                      <div className="text-sm">{comment.text}</div>
                      <StarRating rating={comment.rating} />
                      {/*isAdmin && (delete comment button)*/}
                    </ItemContent>
                    <ItemFooter>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleString()}
                      </div>
                    </ItemFooter>
                  </Item>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
