"use client";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  Slider,
  Textarea,
} from "@nextui-org/react";
import { useQRCode } from "next-qrcode";
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import * as htmlToImage from "html-to-image";
import { LineIcon, LineShareButton } from "react-share";
import { Share } from "@capacitor/share";
import {
  copyImageToClipboard,
  requestClipboardWritePermission,
} from "copy-image-clipboard";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const QrAppRelease = () => {
  const { Canvas: CanvasQR } = useQRCode();
  const [text1, setText1] = React.useState<string>(
    localStorage.getItem("last_save_text1") || ""
  );

  const [text2, setText2] = React.useState<string>(
    localStorage.getItem("last_save_text2") || ""
  );
  const [lastText1List, setLastText1List] = useLocalStorage<string[]>(
    "last_saved_text1_list",
    []
  );
  const [lastText2List, setLastText2List] = useLocalStorage<string[]>(
    "last_saved_text2_list",
    []
  );
  const [qrText, setQrText] = React.useState("");
  const [qrImgUrl, setQrImgUrl] = React.useState("");
  const [qrImgFile, setQrImgFile] = React.useState<any>();
  const [text1Size, setText1Size] = useLocalStorage<number>(
    "last_text1_size",
    36
  );
  const [text2Size, setText2Size] = useLocalStorage<number>(
    "last_text2_size",
    36
  );
  const text1Deferred = useDeferredValue(text1);
  const text2Deferred = useDeferredValue(text2);
  const text1SizeDeferred = useDeferredValue(text1Size);
  const text2SizeDeferred = useDeferredValue(text2Size);
  const qrTextDeferred = useDeferredValue(qrText);

  const [isPending, starTransition] = useTransition();

  const setText1Transition = (value: string) => {
    starTransition(() => setText1(value));
    // setText1(value)
  };
  const setText1SizeTransition = (value: number) => {
    starTransition(() => setText1Size(value));
  };
  const setText2SizeTransition = (value: number) => {
    starTransition(() => setText2Size(value));
  };
  useEffect(() => {
    // Perform localStorage action
    setText1(localStorage.getItem("last_save_text1") || "");
    setText2(localStorage.getItem("last_save_text2") || "");
  }, []);
  const copyImage = async () => {
    const qrCodeView = document.getElementById("qr-view-box");
    if (!qrCodeView) return;
    let imgUrl = "";
    await htmlToImage.toPng(qrCodeView).then(function (dataUrl) {
      /* do something */
      imgUrl = dataUrl;
    });
    if (!imgUrl) return;
    console.log("dataUrl =>", imgUrl);
    // const imageObjectURL = URL.createObjectURL(imgUrl);
    setQrImgUrl(imgUrl);
    await requestClipboardWritePermission().then((hasPermission) => {
      if (hasPermission) {
        copyImageToClipboard(imgUrl)
          .then((value) => {
            console.log("Image Copied");
            toast("Copied");
            // const imageObjectURL = URL.createObjectURL(value);
            // setQrImgUrl(imageObjectURL);
            const file = new File([value], "image.jpg", { type: value.type });
            setQrImgFile(file)
          })
          .catch((e) => {
            console.log("Error: ", e.message);
          });
      }
    });

    localStorage.setItem("last_save_text1", text1.trim());
    localStorage.setItem("last_save_text2", text2.trim());
    if (!lastText1List.includes(text1.trim())) {
      lastText1List.push(text1.trim());
      setLastText1List([...lastText1List]);
    }
    if (!lastText2List.includes(text2.trim())) {
      lastText2List.push(text2.trim());
      setLastText2List([...lastText2List]);
    }
  };
  const text1DefaultItems = useMemo(
    () => lastText1List.map((text) => ({ value: text, label: text })),
    []
  );
  const text2DefaultItems = useMemo(
    () => lastText2List.map((text) => ({ value: text, label: text })),
    []
  );
  const onShare = async () => {
    const canShare = await Share.canShare();
    console.log("canShare =>", canShare);
    console.log("qrImgUrl =>", qrImgUrl);
    if (canShare.value && qrImgFile) {
      await Share.share({
        files: [qrImgFile],
        title: "Title", // titleText
        text: "text", // text
      });
    } else {
      toast("Cannot share with this browser");
    }
  };
  return (
    <div className="flex justify-center">
      <div className="flex flex-col">
        <Autocomplete
          id="qr-text-1"
          allowsCustomValue
          label="Text 1"
          variant="flat"
          //   color="primary"

          className="mb-1"
          listboxProps={{ className: "bg-white rounded-lg text-gray-800" }}
          defaultItems={text1DefaultItems}
          items={text1DefaultItems}
          defaultInputValue={text1}
          value={text1}
          onInputChange={(text) => {
            setText1Transition(text);
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
        <Slider
          //   label="Temperature"
          color="danger"
          step={0.01}
          maxValue={100}
          minValue={0}
          defaultValue={0.4}
          //   classNames={{
          //     // base: "max-w-md gap-3",
          //     filler: "bg-gradient-to-r from-pink-300 to-cyan-300 dark:from-pink-600 dark:to-cyan-800",
          //   }}
          value={text1Size}
          onChange={(value) => setText1SizeTransition(value as number)}
          className="max-w-md pb-3"
        />
        <Autocomplete
          id="qr-text-2"
          allowsCustomValue
          label="Text 2"
          variant="flat"
          className="mb-2"
          listboxProps={{ className: "bg-white rounded-lg text-gray-800" }}
          defaultItems={text2DefaultItems}
          items={text2DefaultItems}
          defaultInputValue={text2}
          value={text2}
          //   color='secondary'

          onInputChange={(text) => {
            setText2(text);
          }}
        >
          {(item) => (
            <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
        <Slider
          color="danger"
          step={0.01}
          maxValue={100}
          minValue={0}
          defaultValue={0.4}
          value={text2Size}
          onChange={(value) => setText2SizeTransition(value as number)}
          className="max-w-md pb-3"
        />
        <Textarea
          minRows={1}
          label="QR Text"
          placeholder="Place your qr text hear"
          className="mb-3"
          onValueChange={(text) => {
            setQrText(text);
          }}
        />
        <div
          id="qr-view-box"
          className="bg-white justify-center items-center flex flex-col relative align-middle py-2 rounded"
        >
          {text1Deferred && (
            <div
              style={{ fontSize: text1SizeDeferred }}
              className="text-red-500 font-medium flex"
            >
              {text1Deferred}
            </div>
          )}
          {text2Deferred && (
            <div
              style={{ fontSize: text2SizeDeferred }}
              className="text-red-500 font-medium"
            >
              {text2Deferred}
            </div>
          )}

          <CanvasQR
            text={qrTextDeferred || "Example QR"}
            options={{
              errorCorrectionLevel: "M",
              margin: 1,
              scale: 4,
              width: 400,
              color: {
                dark: "#000000",
                light: "#ffffff",
              },
            }}
          />
        </div>
        <Button onClick={copyImage} className="mt-2" color="primary">
          Copy
        </Button>
        <Button onClick={onShare} className="mt-2" color="secondary">
          Share
        </Button>
        {/* <LineShareButton
          openShareDialogOnClick={qrImgUrl !== "none"}
          title="ssss"
          url={"ssss"}
        >
          <LineIcon />
        </LineShareButton> */}
      </div>
    </div>
  );
};

export default QrAppRelease;