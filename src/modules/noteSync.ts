import { DialogHelper } from "zotero-plugin-toolkit";

interface NoteState {
  notes: Record<number, string>;
  page: number;
}

export default class NoteSync {
  static openForReader(reader: any): void {
    if (!addon.data.dialog || addon.data.dialog.window?.closed) {
      addon.data.dialog = new DialogHelper(1, 1)
        .addCell(0, 0, {
          tag: "textarea",
          namespace: "html",
          id: "page-note",
          attributes: {
            style: "width:100%;height:100%;",
          },
        })
        .addButton("Close", "close");
      addon.data.dialog.open("Page Notes", {
        width: 300,
        height: 400,
        resizable: true,
        centerscreen: true,
      });
    }
    this.bindReader(reader);
  }

  private static bindReader(reader: any): void {
    if (!reader._noteSync) {
      const state: NoteState = { notes: {}, page: 1 };
      reader._noteSync = state;
      const eventBus = reader?._iframeWindow?.PDFViewerApplication?.eventBus;
      eventBus?.on("pagechanging", (e: any) => {
        const textarea = addon.data.dialog?.window?.document.getElementById(
          "page-note",
        ) as HTMLTextAreaElement | null;
        if (!textarea) return;
        const prev = state.page;
        state.notes[prev] = textarea.value;
        const newPage = e.pageNumber;
        textarea.value = state.notes[newPage] || "";
        state.page = newPage;
      });
    }
    const textarea = addon.data.dialog?.window?.document.getElementById(
      "page-note",
    ) as HTMLTextAreaElement | null;
    if (textarea) {
      const curPage: number = reader._noteSync.page || 1;
      textarea.value = reader._noteSync.notes[curPage] || "";
    }
  }
}
