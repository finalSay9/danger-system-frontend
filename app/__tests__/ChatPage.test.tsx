// __tests__/ChatPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "../app/chats/[id]/page";
import { useAuthStore } from "../lib/store";
import { useRouter } from "next/navigation";
import { sendMessage } from "../lib/api";
import { socketClient } from "../lib/socket";

jest.mock("../lib/store");
jest.mock("next/navigation");
jest.mock("../lib/api");
jest.mock("../lib/socket");
jest.mock("../../../components/MessageList", () => () => <div>MessageList</div>);

test("sends message and clears input", async () => {
  (useAuthStore as jest.Mock).mockRet
  urnValue({
    user: { id: 4, username: "testuser" },
    token: { access_token: "token" },
  });
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
  (sendMessage as jest.Mock).mockResolvedValue({ id: 13, content: "man this not life" });
  (socketClient.connect as jest.Mock).mockReturnValue({ on: jest.fn(), off: jest.fn() });

  render(<ChatPage params={{ id: "2" }} />);
  expect(screen.getByText("MessageList")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "man this not life" } });
  fireEvent.click(screen.getByText("Send"));
  expect(sendMessage).toHaveBeenCalledWith({ chat_id: 2, content: "man this not life", sender_id: 4 });
  expect(screen.getByPlaceholderText("Type a message...")).toHaveValue("");
});