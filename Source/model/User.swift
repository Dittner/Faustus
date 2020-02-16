//
//  User.swift
//  Faustus
//
//  Created by Alexander Dittner on 10.02.2020.
//  Copyright © 2020 Alexander Dittner. All rights reserved.
//

import Foundation
struct User {
    static let projectFolderName:String = "Faustus"
    static let logsFolderName:String = "logs"
    static let userProfileFolderName:String = "profile.plist"
    
    var profile:UserProfile
    var isRegistered:Bool
}

struct UserProfile {
    static let NameKey = "name"
    static let EncryptedPwdKey = "encryptedPwd"
    
    let name:String = ""
    let encryptedPwd:String = ""
}
