#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <React/RCTI18nUtil.h> // Import RCTI18nUtil for RTL support

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"varzeshsoft";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Enable RTL support
  [[RCTI18nUtil sharedInstance] allowRTL:YES];   // Allow RTL languages
  [[RCTI18nUtil sharedInstance] forceRTL:YES];   // Force RTL layout for all content

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end