package com.example.studentmonitoringsystem;

import java.util.Date;

public class Auth {
    public static User getCurrentUser(){
        return new User("1", "sangram@gmail.com", "sangram", "nahid", "Student", "image", new Date(), new Date());
    }
}
