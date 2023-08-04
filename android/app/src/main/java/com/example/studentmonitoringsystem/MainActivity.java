package com.example.studentmonitoringsystem;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import android.os.Bundle;

public class MainActivity extends AppCompatActivity implements NavigationHost {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
//        mAuth = FirebaseAuth.getInstance();
        User user = Auth.getCurrentUser();
        if (savedInstanceState == null) {
//            if (user != null) {
                //startActivity(new Intent(MainActivity.this, HomeActivity.class));
//                finish();
//            } else {
               getSupportFragmentManager()
                        .beginTransaction()
                        .add(R.id.container, new LoginFragment())
                        .commit();
//            }
        }
    }

    @Override
    public void navigateTo(Fragment fragment, Boolean addToBackStack) {
        FragmentTransaction transaction;
        transaction = getSupportFragmentManager()
                .beginTransaction()
                .replace(R.id.container, fragment);
        if (addToBackStack) {
            transaction.addToBackStack(null);
        }
        transaction.commit();
    }

}
