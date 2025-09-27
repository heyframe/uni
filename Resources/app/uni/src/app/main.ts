/** View Adapter */
import VueAdapter from '@/app/adapter/view/vue.adapter';
/** Initializer */
import initializers from '@/app/init';
import postInitializer from '@/app/init-post';

/** Services */

import preInitializer from '@/app/init-pre';
import HeyUni from '@/heyuni-instance';

/** Application Bootstrapper */
const { Application } = HeyUni

const factoryContainer = Application.getContainer('factory')

/** Create View Adapter */
const adapter = new VueAdapter(Application)

Application.setViewAdapter(adapter)

// Add pre-initializers to application
Object.keys(preInitializer).forEach((key) => {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initializer = preInitializer[key]
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Application.addInitializer(key, initializer, '-pre')
})

// Add initializers to application
Object.keys(initializers).forEach((key) => {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initializer = initializers[key]
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Application.addInitializer(key, initializer)
})

// Add post-initializers to application
Object.keys(postInitializer).forEach((key) => {
  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const initializer = postInitializer[key]

  // @ts-expect-error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Application.addInitializer(key, initializer, '-post')
})
