import Image from "next/image";
import Link from "next/link";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="auth-layout">
      <section className="auth-left-section scrollbar-hide-default">
        <Link href={"/"} className="auth-logo">
          <Image
            src={"/assets/icons/logo.svg"}
            alt="Dukem stock logo"
            width={140}
            height={40}
            className="h-8 w-auto"
          />
          <div className="pb-6 lg:pb-8 flex-1">{children}</div>
        </Link>
      </section>
      <section className="auth-right-section">
        <div className="z-10 relative lg:mt-4 lg:mb-16">
          <blockquote className="auth-blockquote">
            <p className="auth-blockquote-text">
              &quot;The stock market is filled with individuals who know the
              price of everything, but the value of nothing.&quot;
            </p>
          </blockquote>
          <div className="flex items-center justify-between">
            <div>
              <cite className="auth-testimonial-info">- Philip Fisher</cite>
              <p className="max-md:text-xs text-gray-500">
                Random guy I dont know
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star, index) => (
                <Image
                  key={index}
                  src={"/assets/icons/star.svg"}
                  width={20}
                  height={20}
                  alt="Star"
                  className="h-5 w-5"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
            <Image src={"/assets/images/dashboard.png"} 
             alt="Dashboard preview"
             width={1140}
             height={1150}
             className="auth-dashboard-preview absolute top-0"
            />
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
