package com.example.studentmonitoringsystem;

import android.app.ProgressDialog;
import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.fragment.app.Fragment;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.checkbox.MaterialCheckBox;
import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;
import com.vansuita.pickimage.bean.PickResult;
import com.vansuita.pickimage.bundle.PickSetup;
import com.vansuita.pickimage.dialog.PickImageDialog;
import com.vansuita.pickimage.listeners.IPickCancel;
import com.vansuita.pickimage.listeners.IPickResult;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;


/**
 * A simple {@link Fragment} subclass.
 */
public class SignUpFragment extends Fragment {


    private TextInputEditText firstNameEditText;
    private TextInputLayout firstNameEditTextLayout;
    private TextInputEditText lastNameEditText;
    private TextInputLayout lastNameEditTextLayout;
    private TextInputEditText emailEditText;
    private TextInputLayout emailEditTextLayout;
    private TextInputEditText newPasswordEditText;
    private TextInputLayout newPasswordEditTextLayout;
    private TextInputEditText confirmPasswordEditText;
    private TextInputLayout confirmPasswordTextLayout;
    private TextInputEditText addImageEditText;

    private MaterialButton signupFragmentSignUpButton;
    private String firstName;
    private String lastName;
    private String email;
    private String newPassword;
    private String comfirmPassword;
    private String accountType;
    private HashMap<String, String> data;
    private ProgressDialog progress;
    private Spinner dropdown;
    private String[] account_type;
    public SignUpFragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        //queue = Volley.newRequestQueue(getContext());
        progress = new ProgressDialog(getActivity(), R.style.MyAlertDialogStyle);
        progress.setMessage("Please Wait...");
        progress.setProgressStyle(ProgressDialog.STYLE_SPINNER);
        progress.setCancelable(false);
        View view = inflater.inflate(R.layout.fragment_sign_up, container, false);
        firstNameEditText = view.findViewById(R.id.signup_firstname_edit_text);
        lastNameEditText = view.findViewById(R.id.signup_lastname_edit_text);
        emailEditText = view.findViewById(R.id.signup_email_edit_text);
        newPasswordEditText = view.findViewById(R.id.signup_newpassword_edit_text);
        confirmPasswordEditText = view.findViewById(R.id.signup_confirmpassword_edit_text);
        signupFragmentSignUpButton = view.findViewById(R.id.createEventButton);
        firstNameEditTextLayout = view.findViewById(R.id.signup_firstname_edit_text_layout);
        lastNameEditTextLayout = view.findViewById(R.id.signup_lastname_edit_text_layout);
        emailEditTextLayout = view.findViewById(R.id.signup_email_edit_text_layout);
        newPasswordEditTextLayout = view.findViewById(R.id.signup_newpassword_edit_text_layout);
        confirmPasswordTextLayout = view.findViewById(R.id.signup_confirmpassword_edit_text_layout);
        dropdown = view.findViewById(R.id.account_type_spinner);
        account_type = new String[]{"student", "teacher"};
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(getContext(), android.R.layout.simple_spinner_dropdown_item, account_type);
        dropdown.setAdapter(adapter);

        dropdown.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                accountType = account_type[position];
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                accountType = null;
            }
        });
        addImageEditText = view.findViewById(R.id.addmedia_edit_text);
        addImageEditText.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                PickImageDialog.build(new PickSetup())
                        .setOnPickResult(new IPickResult() {
                            @Override
                            public void onPickResult(PickResult r) {
                                if(r.getError() != null)
                                    Toast.makeText(getContext(), r.getError().getMessage(), Toast.LENGTH_LONG).show();
                                else
                                    addImageEditText.setText(r.getPath());
                            }
                        })
                        .setOnPickCancel(new IPickCancel() {
                            @Override
                            public void onCancelClick() {
                                //TODO: do what you have to if user clicked cancel
                            }
                        }).show(getParentFragmentManager());
            }
        });
        firstNameEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                isFirstNameValid();
            }
        });
        lastNameEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                isLastNameValid();
            }
        });
        emailEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                isEmailValid();
            }
        });
        newPasswordEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                isPasswordValid();
            }
        });
        confirmPasswordEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                ispasswordMatched();
            }
        });
        signupFragmentSignUpButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (isFirstNameValid() && isLastNameValid() && isEmailValid() &&
                        isPasswordValid() && ispasswordMatched()) {
                    // Signup functionality
                    progress.show();
                    try{
                    firstName = firstNameEditText.getText().toString();
                    lastName = lastNameEditText.getText().toString();
                    email = emailEditText.getText().toString();
                    newPassword = newPasswordEditText.getText().toString();
                    comfirmPassword = confirmPasswordEditText.getText().toString();

                    JSONObject jsonBody = new JSONObject();
                    jsonBody.put("first_name", firstName);
                    jsonBody.put("last_name", lastName);
                    jsonBody.put("email", email);
                    jsonBody.put("password", newPassword);
                    jsonBody.put("retyped_password", comfirmPassword);
                    jsonBody.put("account_type", accountType);
                    final String mRequestBody = jsonBody.toString();
                    Log.d("TAG", "onClick: "+mRequestBody.toString());

                    String url = "http://10.0.2.2:3001/register";
                    RequestQueue queue = Volley.newRequestQueue(getContext());
                    StringRequest request = new StringRequest(Request.Method.POST, url, new com.android.volley.Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            progress.dismiss();
                            Log.d("TAG", "onResponse: "+response);
                            Toast.makeText(getActivity(), "Data added to API", Toast.LENGTH_SHORT).show();
                            try {
                                JSONObject respObj = new JSONObject(response);
                                //String session = respObj.getString("session");
                                Toast.makeText(getActivity(), "Fail to get response = " + response, Toast.LENGTH_SHORT).show();
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    }, new com.android.volley.Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            progress.dismiss();
                            if(error.networkResponse != null && error.networkResponse.data != null){
                                VolleyError err = new VolleyError(new String(error.networkResponse.data));
                                error = err;
                            }
                            Log.e("TAG", "onErrorResponse: "+error.toString());
                            Toast.makeText(getActivity(), "Fail to get response = " + error.toString(), Toast.LENGTH_SHORT).show();
                        }
                    }) {
                        @Override
                        public String getBodyContentType() {
                            return "application/json; charset=utf-8";
                        }

                        @Override
                        public byte[] getBody() throws AuthFailureError {
                            try {
                                return mRequestBody == null ? null : mRequestBody.getBytes("utf-8");
                            } catch (UnsupportedEncodingException uee) {
                                VolleyLog.wtf("Unsupported Encoding while trying to get the bytes of %s using %s", mRequestBody, "utf-8");
                                return null;
                            }
                        }

                        @Override
                        protected Response<String> parseNetworkResponse(NetworkResponse response) {
                            String responseString = "";
                            if (response != null) {
                                responseString = String.valueOf(response.statusCode);
                            }
                            return Response.success(responseString, HttpHeaderParser.parseCacheHeaders(response));
                        }
                    };
                    queue.add(request);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                }
            }
        });


        return view;
    }

//    private void handleSiteVerify(final String tokenResult) {
//        progress.show();
//        String url = "https://www.google.com/recaptcha/api/siteverify";
//        StringRequest request = new StringRequest(Request.Method.POST, url,
//                new Response.Listener<String>() {
//                    @Override
//                    public void onResponse(String response) {
//                        try {
//                            JSONObject jsonObject = new JSONObject(response);
//                            if (jsonObject.getBoolean("success")) {
//                                addUserToDatabase();
//                            } else {
//                                progress.dismiss();
//                                Toast.makeText(getActivity(), String.valueOf(jsonObject.getString("error-codes")), Toast.LENGTH_LONG).show();
//                            }
//                        } catch (Exception ex) {
//                            progress.dismiss();
//                            Log.d("JSONREQUEST", "JSON exception: " + ex.getMessage());
//                        }
//
//                    }
//                }, new Response.ErrorListener() {
//            @Override
//            public void onErrorResponse(VolleyError error) {
//                progress.dismiss();
//                Log.d("JSONREQUEST", "Error message: " + error.getMessage());
//            }
//        }) {
//            @Override
//            protected Map<String, String> getParams() {
//                Map<String, String> params = new HashMap<>();
//                params.put("secret", SECRET_KEY);
//                params.put("response", tokenResult);
//                return params;
//            }
//        };
//        request.setRetryPolicy(new DefaultRetryPolicy(
//                50000,
//                DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
//                DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
//        queue.add(request);
//    }
//
//    private void addUserToDatabase() {
//        firstName = firstNameEditText.getText().toString();
//        lastName = lastNameEditText.getText().toString();
//        email = emailEditText.getText().toString();
//        newPassword = newPasswordEditText.getText().toString();
//        comfirmPassword = confirmPasswordEditText.getText().toString();
//        phone = phoneEditText.getText().toString();
//        mAuth.createUserWithEmailAndPassword(email, newPassword)
//                .addOnCompleteListener(new OnCompleteListener<AuthResult>() {
//                    @Override
//                    public void onComplete(@NonNull Task<AuthResult> task) {
//                        if (task.isSuccessful()) {
//                            user = mAuth.getCurrentUser();
//                            boolean emailVerified = user.isEmailVerified();
//                            if (!emailVerified) {
//                                user.sendEmailVerification().addOnCompleteListener(new OnCompleteListener<Void>() {
//                                    @Override
//                                    public void onComplete(@NonNull Task<Void> task) {
//                                        if (task.isSuccessful()) {
//                                            Toast.makeText(getActivity(), "Verification email send to your email: " + task.isComplete(), Toast.LENGTH_LONG)
//                                                    .show();
//                                            data = new HashMap<>();
//                                            data.put("User Name", firstName + " " + lastName);
//                                            data.put("User Id", user.getUid());
//                                            data.put("Email", user.getEmail());
//                                            firestore.collection("Users")
//                                                    .document(user.getUid())
//                                                    .set(data, SetOptions.merge())
//                                                    .addOnCompleteListener(new OnCompleteListener<Void>() {
//                                                        @Override
//                                                        public void onComplete(@NonNull Task<Void> task) {
//                                                            if (task.isSuccessful()) {
//                                                                progress.dismiss();
//                                                                Toast.makeText(getActivity(), "User Signup Successfull", Toast.LENGTH_LONG).show();
//                                                                ((NavigationHost) getActivity()).navigateTo(new LoginFragment(), false);
//                                                            } else {
//                                                                user.delete();
//                                                                progress.dismiss();
//                                                                Toast.makeText(getActivity(), "User Signup failed: " + task.getException(), Toast.LENGTH_LONG).show();
//                                                            }
//                                                        }
//                                                    }).addOnFailureListener(new OnFailureListener() {
//                                                @Override
//                                                public void onFailure(@NonNull Exception e) {
//                                                    user.delete();
//                                                    progress.dismiss();
//                                                    Toast.makeText(getActivity(), "User Signup failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
//                                                }
//                                            });
//                                        }
//                                    }
//                                });
//
//                            }
//                        }
//                    }
//                }).addOnFailureListener(new OnFailureListener() {
//            @Override
//            public void onFailure(@NonNull Exception e) {
//                progress.dismiss();
//                Toast.makeText(getActivity(), "User Signup Failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
//            }
//        });
//    }

    private boolean ispasswordMatched() {
        if (confirmPasswordEditText.getText() == null && !isPasswordValid()) {
            confirmPasswordTextLayout.setError("Invalid password");
            return false;
        } else {
            if (newPasswordEditText.getText().toString().equals(confirmPasswordEditText.getText().toString())) {
                confirmPasswordTextLayout.setError(null);
                return true;
            } else {
                confirmPasswordTextLayout.setError("Password not matched");
                return false;
            }
        }
    }

    private boolean isPasswordValid() {
        String passwordRegex = "(((?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])).{6,})";
        Pattern pat = Pattern.compile(passwordRegex);

        if (newPasswordEditText.getText() == null) {
            newPasswordEditTextLayout.setError("Password must contain at least one lowercase letter, capital letter," +
                    " one digit, minimum 6 letters");
            return false;
        } else {
            if (pat.matcher(newPasswordEditText.getText().toString()).matches()) {
                newPasswordEditTextLayout.setError(null);
                return true;
            } else {
                newPasswordEditTextLayout.setError("Password must contain at least one lowercase letter, capital letter," +
                        " one digit, special character, minimum 8 letters");
                return false;
            }
        }
    }


    private boolean isEmailValid() {
        String emailRegex = "^[a-zA-Z0-9_+&*-]+(?:\\." +
                "[a-zA-Z0-9_+&*-]+)*@" +
                "(?:[a-zA-Z0-9-]+\\.)+[a-z" +
                "A-Z]{2,7}$";

        Pattern pat = Pattern.compile(emailRegex);
        if (emailEditText.getText() == null) {
            emailEditTextLayout.setError("Invalid email");
            return false;
        } else {
            if (pat.matcher(emailEditText.getText().toString()).matches()) {
                emailEditTextLayout.setError(null);
                return true;
            } else {
                emailEditTextLayout.setError("Invalid email");
                return false;
            }
        }
    }

    private boolean isLastNameValid() {
        if (lastNameEditText.getText() == null) {
            lastNameEditTextLayout.setError("invalid lastname");
            return false;
        } else {
            if (lastNameEditText.getText().toString().isEmpty()) {
                lastNameEditTextLayout.setError("invalid lastname");
                return false;
            } else {
                Boolean isValid = true;
                for (int i = 0; i < lastNameEditText.getText().toString().length(); i++) {
                    if (!Character.isAlphabetic(lastNameEditText.getText().toString().charAt(i))
                            && !Character.isSpaceChar(firstNameEditText.getText().toString().charAt(i))) {
                        isValid = false;
                    }
                }
                if (isValid) {
                    lastNameEditTextLayout.setError(null);
                    return true;
                } else {
                    lastNameEditTextLayout.setError("invalid lastname");
                    return false;
                }

            }
        }
    }

    private boolean isFirstNameValid() {
        if (firstNameEditText.getText() == null) {
            firstNameEditTextLayout.setError("invalid firstname");
            return false;
        } else {
            if (firstNameEditText.getText().toString().isEmpty()) {
                firstNameEditTextLayout.setError("invalid firstname");
                return false;
            } else {
                Boolean isValid = true;
                for (int i = 0; i < firstNameEditText.getText().toString().length(); i++) {
                    if (!Character.isAlphabetic(firstNameEditText.getText().toString().charAt(i))
                            && !Character.isSpaceChar(firstNameEditText.getText().toString().charAt(i))) {
                        isValid = false;
                    }
                }
                if (isValid) {
                    firstNameEditTextLayout.setError(null);
                    return true;
                } else {
                    firstNameEditTextLayout.setError("invalid firstname");
                    return false;
                }

            }
        }
    }

}
