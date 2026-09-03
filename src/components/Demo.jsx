import { useState } from "react";
import loader from "../assets/loader.svg";

function App() {
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [isFetching, setIsFetching] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleButtonClick = async () => {
    try {
      setIsFetching(true);
      const result = await query(inputValue);
      console.log(result);
      if (result) {
        setOutputValue(result[0].summary_text);
      } else {
        console.error("Result generated_text is undefined:", result);
      }
    } catch (error) {
      console.error("Failed to fetch result:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(outputValue)
      .then(() => alert("Text copied to clipboard!"))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  async function query(data) {
    const huggingFaceToken = import.meta.env.VITE_HUGGING_FACE_API_TOKEN;

    if (!huggingFaceToken) {
      throw new Error(
        "Missing VITE_HUGGING_FACE_API_TOKEN. Add it to your .env.local file.",
      );
    }

    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6",
        {
          headers: {
            Authorization: `Bearer ${huggingFaceToken}`,
          },
          method: "POST",
          body: JSON.stringify({ inputs: data }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error during the API call:", error);
      throw error;
    }
  }

  return (
    <div>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col space-y-3 items-center justify-center rounded-lg bg-gray-700 px-3 py-6">
          <textarea
            className="mx-4 w-96 h-96 rounded-lg border focus:outline-none focus:ring-0 focus:border-green-500 border-gray-600 bg-gray-800 p-2.5 text-sm text-white placeholder-gray-400"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter text here..."
          />
          <div className="group relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
            <button
              onClick={handleButtonClick}
              disabled={isFetching}
              className="relative rounded-lg bg-yellow-700 px-7 py-4 text-white"
            >
              {isFetching ? "Generating..." : "Get Result"}
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-3 items-center justify-center rounded-lg bg-gray-700 px-3 py-6">
          <textarea
            className="mx-4 w-96 h-96 rounded-lg border focus:outline-none focus:border-yellow-500 focus:ring-0 border-gray-600 bg-gray-800 p-2.5 text-sm text-white placeholder-gray-400"
            placeholder=""
            value={outputValue}
            readOnly
          />

          <div className="group relative">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500 opacity-75 blur transition duration-500 group-hover:opacity-100"></div>
            <button
              onClick={handleCopy}
              disabled={!outputValue}
              className="relative rounded-lg bg-green-600 px-7 py-4 text-white"
            >
              {(isFetching && (
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={loader} alt="loader" className="animate-spin" />
                </div>
              )) ||
                "Copy Text"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
