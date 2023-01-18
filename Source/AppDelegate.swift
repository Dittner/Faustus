//
//  AppDelegate.swift
//  Faustus
//
//  Created by Alexander Dittner on 06.01.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Cocoa
import Combine
import SwiftUI

@NSApplicationMain
class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    var window: NSWindow?
    private var disposeBag: Set<AnyCancellable> = []

    private var docViewModel: DocViewModel!
    func applicationDidFinishLaunching(_ aNotification: Notification) {
        let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
        let dropboxUrl = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent(StorageDirectory.dropbox.rawValue)

        var isDir: ObjCBool = true
        let hasDropboxProjectDir = FileManager.default.fileExists(atPath: dropboxUrl.appendingPathComponent(StorageDirectory.project.rawValue).path, isDirectory: &isDir)

        DocumentsStorage.shared = DocumentsStorage(documentsURL: hasDropboxProjectDir ? dropboxUrl : documentsURL)

        Logger.run()
        AppModel.shared.loadUser()

        let mainWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 500, height: 600),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)

        docViewModel = DocViewModel()
        mainWindow.contentView = CustomWindow(rootView: RootView()
            .environmentObject(TextFocus())
            .environmentObject(ModalViewObservable())
            .environmentObject(RootViewModel())
            .environmentObject(LoginViewModel())
            .environmentObject(SearchViewModel())
            .environmentObject(HistoryViewModel())
            .environmentObject(docViewModel))
        mainWindow.makeKeyAndOrderFront(nil)
        mainWindow.titlebarAppearsTransparent = true
        mainWindow.isMovableByWindowBackground = true
        mainWindow.isOpaque = false
        mainWindow.backgroundColor = .black
        mainWindow.moveToCenter()
        mainWindow.delegate = self

        window = mainWindow

        NSEvent.addLocalMonitorForEvents(matching: .keyDown) {
            if self.keyDown(with: $0) {
                return nil // needed to get rid of purr sound
            } else {
                return $0
            }
        }
    }

    private func keyDown(with event: NSEvent) -> Bool {
        if AppModel.shared.selectedConspectus.state.isEditing { return false }

        switch event.keyCode {
        case 123:
            docViewModel.quoteListController.showPrevQuote()
        case 124:
            docViewModel.quoteListController.showNextQuote()
        case 125:
            docViewModel.scrollController.updateScrollPosition(with: -10)
        case 126:
            docViewModel.scrollController.updateScrollPosition(with: 10)
        default:
            return false
        }

        return window?.firstResponder == nil || window?.firstResponder is NSWindow
    }

    func expandWindow() {
        window?.restoreLastFrame()
        window?.isMovableByWindowBackground = false
    }

    private var moveWindowDebouncer: Debouncer?
    func windowDidMove(_ notification: Notification) {
        if let window = window, AppModel.shared.areUserFilesReady {
            if moveWindowDebouncer == nil {
                moveWindowDebouncer = Debouncer(seconds: 5)
            }
            moveWindowDebouncer!.debounce {
                logInfo(tag: .APP, msg: "window, wid = \(window.frame.width), hei = \(window.frame.height)")
                window.storeFrame()
            }
        }
    }

    func windowDidEndLiveResize(_ notification: Notification) {
        if let window = window, AppModel.shared.areUserFilesReady {
            logInfo(tag: .APP, msg: "window, wid = \(window.frame.width), hei = \(window.frame.height)")
            window.storeFrame()
        }
    }

    @IBAction func menuSave(_ sender: Any) {
        AppModel.shared.selectedConspectus.store()
    }

    @IBAction func toggleEditState(_ sender: Any) {
        if !AppModel.shared.selectedConspectus.state.isRemoved {
            AppModel.shared.selectedConspectus.state.isEditing.toggle()
        }
    }

    func windowShouldClose(_ sender: NSWindow) -> Bool {
        NSApplication.shared.hide(nil)
        return false
    }
}

class CustomWindow<Content>: NSHostingView<Content>, ObservableObject where Content: View {
    override func scrollWheel(with event: NSEvent) {
        NotificationCenter.default.post(name: .didWheelScroll, object: event)
    }
}
