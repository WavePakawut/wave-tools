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
  useRef,
  useState,
  useTransition,
} from "react";
import * as htmlToImage from "html-to-image";
import { LineIcon, LineShareButton } from "react-share";

import {
  copyImageToClipboard,
  requestClipboardWritePermission,
} from "copy-image-clipboard";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { RWebShare } from "react-web-share";
import { error } from "console";
import { getBase64ImageFile } from "@/helpers";
import generatePDF from "react-to-pdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const QrAppRelease = () => {
  const qrBoxRef = useRef(null);
  const { Canvas: CanvasQR } = useQRCode();
  const [text1, setText1] = React.useState<string>("");

  const [text2, setText2] = React.useState<string>("");
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
    await htmlToImage
      .toPng(qrCodeView)
      .then(function (dataUrl) {
        /* do something */
        imgUrl = dataUrl;
      })
      .catch((error) => {
        toast("htmlToImage error:" + error.toString());
      });
    if (!imgUrl) return;
    console.log("dataUrl =>", imgUrl);
    // const imageObjectURL = URL.createObjectURL(imgUrl);
    setQrImgUrl(imgUrl);
    await requestClipboardWritePermission()
      .then((hasPermission) => {
        if (hasPermission) {
          copyImageToClipboard(imgUrl)
            .then((value) => {
              console.log("Image Copied");
              toast("Copied");
              // const imageObjectURL = URL.createObjectURL(value);
              // setQrImgUrl(imageObjectURL);
              const file = new File([value], "image.jpg", { type: value.type });
              setQrImgFile(file);
            })
            .catch((e) => {
              console.log("Error: ", e.message);
            });
        }
      })
      .catch((error) => {
        toast("requestClipboardWritePermission error:" + error.toString());
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
  //   const onShare = async () => {

  //     const canShare = navigator.canShare();
  //     console.log("canShare =>", canShare);
  //     console.log("qrImgUrl =>", qrImgUrl);
  //     if (canShare && qrImgFile) {
  //       await navigator.share({
  //         files: [qrImgFile],
  //         title: "Title", // titleText
  //         text: "text", // text
  //       });
  //     } else {
  //       toast("Cannot share with this browser");
  //     }
  //   };
  const onShare2 = async () => {
    const qrCodeView = document.getElementById("qr-view-box");

    if (!qrCodeView) return;
    let imgUrl = "";
    await htmlToImage
      .toJpeg(qrCodeView)
      .then(function (dataUrl) {
        /* do something */
        imgUrl = dataUrl;
      })
      .catch((error) => {
        toast("htmlToImage error:" + error.toString());
      });
    if (!imgUrl) return;
    console.log("dataUrl =>", imgUrl);
    const file = getBase64ImageFile(imgUrl);
    setQrImgFile(file);
    setTimeout(() => {
      const btnWebShare = document.getElementById("btn_web_share");
      btnWebShare?.click();
    }, 1000);
  };
  const onShare = async () => {
    const qrCodeView = document.getElementById("qr-view-box");
    if (!qrCodeView) return;
    if (!qrBoxRef.current) return;
    const canvas = await html2canvas(qrBoxRef.current);
    const imgUrl = canvas.toDataURL("image/png");

    console.log("dataUrl =>", imgUrl);
    const file = getBase64ImageFile(imgUrl);
    setQrImgFile(file);
    setTimeout(() => {
      const btnWebShare = document.getElementById("btn_web_share");
      btnWebShare?.click();
    }, 1000);
  };
  const onSharePdf = async () => {
    const getTargetElement = () => document.getElementById("qr-view-box");
    if (!getTargetElement) return;
    // const qrPdf = await generatePDF(getTargetElement, {
    //   filename: "page.pdf",
    //   method: "build",
    // });

    // const pdfData = qrPdf.output();
    if (!qrBoxRef.current) return;
    let success = false;
    try {
      const canvas = await html2canvas(qrBoxRef.current);
      const pdfDoc = new jsPDF();
      const imgData = canvas.toDataURL("image/png");

      const pdfWidth = pdfDoc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdfDoc.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // pdfDoc.save("generate");
      const pdfData = pdfDoc.output("blob");
      // console.log('pdfData =>',pdfData)
      // const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
      const imageFile = new File([pdfData], "page2.pdf", {
        type: "application/pdf",
        lastModified: Date.now(),
      });
      console.log("imageFile =>", imageFile);
      setQrImgFile(imageFile);
      success = true;
    } catch (error) {
      console.error("Error generating PDF:", error);
    }

    if (!success) return;

    // Create a Blob from the PDF data
    // const pdfBlob = new Blob([pdfData], { type: "application/pdf" });
    // const imageFile = new File([pdfBlob], "page2.pdf", {
    //   type: "application/pdf",
    // });

    // setQrImgFile(imageFile);
    setTimeout(() => {
      const btnWebShare = document.getElementById("btn_web_share");
      btnWebShare?.click();
    }, 1000);
  };
  return (
    <div className="flex justify-center p-2">
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
          ref={qrBoxRef}
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
        <Button
          variant="shadow"
          onClick={copyImage}
          className="mt-2"
          color="primary"
        >
          Copy
        </Button>
        <Button
          variant="shadow"
          onClick={onShare}
          className="mt-2 bg-green-600"
          color="secondary"
        >
          Share Image
        </Button>
        <Button
          variant="shadow"
          onClick={onSharePdf}
          className="mt-2 bg-red-500"
          color="secondary"
        >
          Share PDF
        </Button>
        <RWebShare
          data={
            {
              // text: "Like humans, flamingos make friends for life",
              files: [qrImgFile],
              // title: "Flamingos",
            } as any
          }
          onClick={() => console.log("shared successfully!")}
        >
          <button id={"btn_web_share"} />
        </RWebShare>

        {/* {qrImgFile && (
          <RWebShare
            data={
              {
                text: "Like humans, flamingos make friends for life",
                files: [qrImgFile],
                title: "Flamingos",
              } as any
            }
            onClick={() => console.log("shared successfully!")}
          >
            <Button variant="shadow" className="mt-2" color="secondary">
              Share
            </Button>
          </RWebShare>
        )} */}

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
