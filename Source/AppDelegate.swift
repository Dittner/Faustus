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

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        Logger.run()
        AppModel.shared.$state
            .debounce(for: 0.1, scheduler: RunLoop.main)
            .dropFirst()
            .map { $0 != .auth }
            .removeDuplicates()
            .sink(receiveValue: { _ in
                self.expandWindow()
            })
            .store(in: &disposeBag)

        let mainWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 500, height: 700),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)

        mainWindow.contentView = NSHostingView(rootView: RootView()
            .environmentObject(TextFocus())
            .environmentObject(DocViewModel()))
        mainWindow.makeKeyAndOrderFront(nil)
        mainWindow.titlebarAppearsTransparent = true
        mainWindow.isMovableByWindowBackground = true
        mainWindow.isOpaque = false
        mainWindow.backgroundColor = .black
        mainWindow.moveToCenter()
        mainWindow.delegate = self

        window = mainWindow
    }

    func expandWindow() {
        window?.restoreLastFrame()
        window?.isMovableByWindowBackground = false
    }

    private var moveWindowDebouncer: Debouncer?
    func windowDidMove(_ notification: Notification) {
        if let window = window, AppModel.shared.state != .auth {
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
        if let window = window, AppModel.shared.state != .auth {
            logInfo(tag: .APP, msg: "window, wid = \(window.frame.width), hei = \(window.frame.height)")
            window.storeFrame()
        }
    }

    @IBAction func menuSave(_ sender: Any) {
        _ = AppModel.shared.selectedConspectus.store()
    }
}
