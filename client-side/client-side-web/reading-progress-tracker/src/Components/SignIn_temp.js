<div className="vh-100 flex flex-column justify-between">
  <section class="mt5 mw5 mw7-ns center login-bg pa3 ph5-ns br3">
    <div className="pa2 tc">
      <img src={logo} className="br-100 h3 w3 dib" alt="logo" />
    </div>

    <main className="pa4 black-80">
      <form className="measure center">
        <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
          <legend className="f4 fw6 ph0 mh0 center">Sign In</legend>
          <div className="mt3">
            <label className="db fw6 lh-copy f6" for="email-address">
              Email
            </label>
            <input
              className="pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
              type="email"
              name="email-address"
              id="email-address"
            />
          </div>
          <div className="mv3">
            <label className="db fw6 lh-copy f6" for="password">
              Password
            </label>
            <input
              className="b pa2 input-reset ba bg-transparent hover-bg-black hover-white w-100"
              type="password"
              name="password"
              id="password"
            />
          </div>
        </fieldset>
        <div className="w-100 pointer f6 link tc dim br2 ph3 pv2 mb2 white bg-black">
          Sign In
        </div>
        <div className="tc w-100">
          <hr className="mw3 bb bw1 b--black-10" />
        </div>
        <div className="lh-copy mt3">
          <a href="#0" className="f6 link dim black ">
            Sign up
          </a>
          <a href="#0" className="f6 link dim black db">
            Forgot your password?
          </a>
        </div>
      </form>
    </main>
  </section>

  <footer className="bg-near-black white-80 pv4 pa4 ph2">
    <p className="f6 flex justify-between">
      <span className="dib mr4 mr5-ns">
        ©2021 summer21.cse327.2.4 LLC, Inc.
      </span>
      <span>
        <a className="link white-80 ph2 hover-light-purple" href="/terms">
          Terms
        </a>
        <a className="link white-80 ph2 hover-gold" href="/privacy">
          Privacy
        </a>
        <a className="link white-80 ph2 hover-blue" href="#">
          Security
        </a>
        <a className="link white-80 ph2 hover-green" href="#">
          Contact Us
        </a>
      </span>
    </p>
  </footer>
</div>;
