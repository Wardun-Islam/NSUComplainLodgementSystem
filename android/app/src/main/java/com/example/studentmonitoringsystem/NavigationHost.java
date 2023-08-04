package com.example.studentmonitoringsystem;

import androidx.fragment.app.Fragment;

interface NavigationHost {
    void navigateTo(Fragment fragment, Boolean addToBackStack);
}
