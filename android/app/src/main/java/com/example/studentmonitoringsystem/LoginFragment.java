package com.example.studentmonitoringsystem;


import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageButton;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

import java.util.HashMap;
import java.util.regex.Pattern;


/**
 * A simple {@link Fragment} subclass.
 */
public class LoginFragment extends Fragment implements View.OnClickListener {

    private static final int RC_SIGN_IN = 1;
    private Button customLoginButton;
//    private LoginButton loginButton;
    private ImageButton googleSignInButton;
    private User user;
//    private GoogleSignInClient googleSignInClient;
    private Button signUpButton;
//    private CallbackManager mCallbackManager;
    private String email;
    private String password;
    private TextInputEditText passwordField;
    private TextInputEditText emailField;
    private TextInputLayout emailLayout;
    private TextInputLayout passwordLayout;
    private MaterialButton forgetPasswordButton;
    private HashMap<String, String> data;
    private AlertDialog alertDialog;
    private TextInputEditText passwordResetEmailField;
    private MaterialButton comfirmPasswordResetButton;
    private TextInputLayout passwordResetEmailLayout;
    private ProgressDialog progressDialog;

    public LoginFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        progressDialog = new ProgressDialog(getActivity(), R.style.MyAlertDialogStyle);
        progressDialog.setCancelable(false);
        progressDialog.setMessage("Please wait...");
        progressDialog.setProgressStyle(ProgressDialog.STYLE_SPINNER);
        customLoginButton = view.findViewById(R.id.login_fragment_login_button);
        emailField = view.findViewById(R.id.login_fragment_email_field);
        passwordField = view.findViewById(R.id.login_fragment_password_field);
        emailLayout = view.findViewById(R.id.login_fragment_email_layout);
        passwordLayout = view.findViewById(R.id.login_fragment_password_layout);
        passwordField.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                if (isPasswordValid(passwordField.getText())) {
                    passwordLayout.setError(null); //Clear the error
                }
            }
        });
        passwordField.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (isPasswordValid(passwordField.getText())) {
                    passwordLayout.setError(null); //Clear the error
                }
                return false;
            }
        });
        emailField.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                if (isEmailValid(emailField.getText())) {
                    emailLayout.setError(null);
                }
            }
        });
        emailField.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View view, int i, KeyEvent keyEvent) {
                if (isEmailValid(emailField.getText())) {
                    emailLayout.setError(null);
                }
                return false;
            }
        });
        customLoginButton.setOnClickListener(this);
        googleSignInButton = view.findViewById(R.id.login_fragment_google_federate_signin_button);
        googleSignInButton.setOnClickListener(this);

//        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
//                .requestIdToken(getString(R.string.default_web_client_id))
//                .requestEmail()
//                .build();
//        googleSignInClient = GoogleSignIn.getClient(getActivity(), gso);
        signUpButton = view.findViewById(R.id.login_fragment_signup_button);
        signUpButton.setOnClickListener(this);
        return view;
    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.login_fragment_google_federate_signin_button:
                //googleSignIn();
                break;
            case R.id.login_fragment_signup_button:
                SignUP();
                break;
            case R.id.login_fragment_login_button:
                login();
                break;
        }
    }

    private void login() {
        if (isEmailValid(emailField.getText())) {
            if (isPasswordValid(passwordField.getText())) {
                progressDialog.show();
                email = emailField.getText().toString();
                password = passwordField.getText().toString();
                // TODO: Google signin functionality
            } else {
                passwordLayout.setError("Password must contain at least one lowercase letter, capital letter," +
                        " one digit, special character, minimum 8 letters");
            }
        } else {
            emailLayout.setError("Invalid Email");
        }
    }

    private boolean isEmailValid(@Nullable Editable email) {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\." +
                "[a-zA-Z0-9_+&*-]+)*@" +
                "(?:[a-zA-Z0-9-]+\\.)+[a-z" +
                "A-Z]{2,7}$";

        Pattern pat = Pattern.compile(emailRegex);
        if (email == null) {
            return false;
        } else {
            return pat.matcher(email).matches();
        }
    }

    private boolean isPasswordValid(@Nullable Editable text) {
        String passwordRegex = "(((?=.*[a-z])(?=.*[0-9])(?=.*[@#$%&*_+=!~/.^?])(?=.*[A-Z])).{8,})";
        Pattern pat = Pattern.compile(passwordRegex);
        if (text == null) {
            return false;
        } else {
            return pat.matcher(text).matches();
        }
    }


    private void SignUP() {
        ((NavigationHost) getActivity()).navigateTo(new SignUpFragment(), true);
    }

//    private void googleSignIn() {
//        //Intent intent = googleSignInClient.getSignInIntent();
//        //startActivityForResult(intent, RC_SIGN_IN);
//    }
//
//    @Override
//    public void onActivityResult(int requestCode, int resultCode, Intent data) {
//
//        // Result returned from launching the Intent from GoogleSignInApi.getSignInIntent(...);
//        if (requestCode == RC_SIGN_IN) {
//            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
//            try {
//                // Google Sign In was successful, authenticate with Firebase
//                GoogleSignInAccount account = task.getResult(ApiException.class);
//                firebaseAuthWithGoogle(account);
//            } catch (ApiException e) {
//                // Google Sign In failed, update UI appropriately
//                Log.w("SignIn", "Google sign in failed", e);
//                Toast.makeText(getActivity(), "Google sign in failed " + e, Toast.LENGTH_LONG).show();
//            }
//        }
//        mCallbackManager.onActivityResult(requestCode, resultCode, data);
//        super.onActivityResult(requestCode, resultCode, data);
//    }

//    private void userAuthWithGoogle(GoogleSignInAccount acct) {
//        Log.d("SignIn", "firebaseAuthWithGoogle:" + acct.getId());
//        AuthCredential credential = GoogleAuthProvider.getCredential(acct.getIdToken(), null);
//        firebaseAuth.signInWithCredential(credential).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
//            @Override
//            public void onComplete(@NonNull Task<AuthResult> task) {
//                if (task.isSuccessful()) {
//                    // Sign in success, update UI with the signed-in user's information
//                    Log.d("SignIn", "signInWithCredential:success");
//                    boolean isNew = task.getResult().getAdditionalUserInfo().isNewUser();
//                    if (isNew) {
//                        storeInDatabase();
//                    } else {
//                        Toast.makeText(getActivity(), "Signing in completed: " + task.isComplete(), Toast.LENGTH_LONG)
//                                .show();
//                        startActivity(new Intent(getActivity(), HomeActivity.class));
//                        getActivity().finish();
//                    }
//                } else {
//                    // If sign in fails, display a message to the user.
//                    Log.w("SignIn", "signInWithCredential:failure", task.getException());
//                    Toast.makeText(getActivity(), "Google sign in failed " + task.getException(), Toast.LENGTH_LONG)
//                            .show();
//                }
//            }
//        });
//    }

//    private void storeInDatabase() {
//        progressDialog.show();
//        user = firebaseAuth.getCurrentUser();
//        if (user != null) {
//            // Name, email address, and profile photo Url
//            String name = user.getDisplayName();
//            String email = user.getEmail();
//
//            // Check if user's email is verified
//            boolean emailVerified = user.isEmailVerified();
//            if (!emailVerified) {
//                user.sendEmailVerification().addOnCompleteListener(new OnCompleteListener<Void>() {
//                    @Override
//                    public void onComplete(@NonNull Task<Void> task) {
//                        if (task.isSuccessful()) {
//                            Toast.makeText(getActivity(), "Verification email send to your email: " + task.isComplete(), Toast.LENGTH_LONG)
//                                    .show();
//                        }
//                    }
//                }).addOnFailureListener(new OnFailureListener() {
//                    @Override
//                    public void onFailure(@NonNull Exception e) {
//                        Toast.makeText(getActivity(), "Failed to send verification email: " + e.getMessage(), Toast.LENGTH_LONG)
//                                .show();
//                    }
//                });
//            } else {
//                Toast.makeText(getActivity(), "Failed to send verification email", Toast.LENGTH_LONG).show();
//            }
//            // The user's ID, unique to the Firebase project. Do NOT use this value to
//            // authenticate with your backend server, if you have one. Use
//            // FirebaseUser.getIdToken() instead.
//
//            String uid = user.getUid();
//            data = new HashMap<>();
//            data.put("User Name", name);
//            data.put("Email", email);
//            data.put("User Id", uid);
//            firestore.collection("Users")
//                    .document(uid)
//                    .set(data, SetOptions.merge()).addOnCompleteListener(new OnCompleteListener<Void>() {
//                @Override
//                public void onComplete(@NonNull Task<Void> task) {
//                    if (task.isSuccessful()) {
//                        progressDialog.dismiss();
//                        Log.d("New User", "Signing in completed as new user: " + user.getUid());
//                        Toast.makeText(getActivity(), "Signing in completed as new user: " + task.isComplete(), Toast.LENGTH_LONG)
//                                .show();
//                        startActivity(new Intent(getActivity(), HomeActivity.class));
//                        getActivity().finish();
//                    } else {
//                        Log.d("New User Failed", "Signing in failed as new user: " + task.getException());
//                        progressDialog.dismiss();
//                        user.delete();
//                    }
//                }
//            }).addOnFailureListener(new OnFailureListener() {
//                @Override
//                public void onFailure(@NonNull Exception e) {
//                    Log.d("New User Failed", "Signing in failed as new user: " + e.getMessage());
//                    progressDialog.dismiss();
//                    user.delete();
//                }
//            });
//        }
//    }

}
